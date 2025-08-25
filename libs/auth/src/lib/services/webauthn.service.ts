// libs/auth/src/lib/services/webauthn.service.ts
// -----------------------------------------------------------------------------
// WebAuthn service with Redis-backed challenges and a pluggable credential
// store. Compatible with @simplewebauthn/server v13.* and its d.ts quirks.
// -----------------------------------------------------------------------------

import { Injectable, Optional } from '@nestjs/common'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON
} from '@simplewebauthn/server'

import type { CacheRepository, Seconds } from '@helixai/redis'
import type { AuditService } from '@helixai/audit'

/* =============================================================================
 * Types & contracts
 * ========================================================================== */

/**
 * Minimal persisted authenticator record.
 * Keep IDs/keys as base64url strings for JSON/URL safety.
 */
export interface WebAuthnCredentialRecord {
  id?: string
  userId: string
  credentialId: string // base64url
  publicKey: string // base64url
  counter: number
  label?: string | null
  transports?: string[] | null
  backupEligible?: boolean | null
  backupState?: boolean | null
  createdAt?: Date
  updatedAt?: Date
}

/** DB abstraction keeps this service framework- and ORM-agnostic. */
export interface WebAuthnCredentialStore {
  findByUserId(userId: string): Promise<WebAuthnCredentialRecord[]>
  findByCredentialId(
    credentialId: string
  ): Promise<WebAuthnCredentialRecord | null>
  upsert(cred: WebAuthnCredentialRecord): Promise<WebAuthnCredentialRecord>
  updateCounter(credentialId: string, newCounter: number): Promise<void>
}

/** External options (may include a readonly array from env parsing). */
export interface WebAuthnServiceOptions {
  rpName: string
  rpID: string
  origins: string[] | readonly string[]
  timeoutMs?: number
  requireResidentKey?: boolean
  userVerification?: 'required' | 'preferred' | 'discouraged'
  challengeTtl?: Seconds
}

/**
 * Resolved runtime config (what the service actually uses).
 * NOTE: `origins` is **mutable** here to satisfy @simplewebauthn types.
 */
type ResolvedWebAuthnConfig = {
  rpName: string
  rpID: string
  origins: string[] // <- always mutable in the resolved config
  timeoutMs: number
  requireResidentKey: boolean
  userVerification: 'required' | 'preferred' | 'discouraged'
  challengeTtl: Seconds
}

/* =============================================================================
 * Utilities
 * ========================================================================== */

/** Base64url encode (no padding). Accepts bytes. */
function toB64url(input: ArrayBuffer | Uint8Array): string {
  const buf =
    input instanceof Uint8Array
      ? Buffer.from(input)
      : Buffer.from(input as ArrayBuffer)
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

/** Base64url decode into bytes. */
function fromB64url(b64url: string): Buffer {
  const pad = (s: string) => s + '==='.slice((s.length + 3) % 4)
  const b64 = pad(b64url.replace(/-/g, '+').replace(/_/g, '/'))
  return Buffer.from(b64, 'base64')
}

/** UTF-8 string → bytes. */
function utf8Bytes(s: string): Uint8Array {
  return Buffer.from(s, 'utf8')
}

/** Safe audit helper (emit → record → log), never throws. */
type AuditLike =
  | { emit?: Function; record?: Function; log?: Function }
  | undefined
async function audit(a: AuditService | AuditLike, event: string, data?: any) {
  if (!a) return
  const anyA: any = a
  try {
    if (typeof anyA.emit === 'function') await anyA.emit(event, data)
    else if (typeof anyA.record === 'function') await anyA.record(event, data)
    else if (typeof anyA.log === 'function') await anyA.log(event, data)
  } catch {
    /* ignore audit errors */
  }
}

/** Redis keys for short-lived per-user challenges. */
const kReg = (userId: string) => `webauthn:reg:chal:${userId}`
const kAuth = (userId: string) => `webauthn:auth:chal:${userId}`

/**
 * Coerce possibly-`readonly string[]` into a mutable `string[]` because
 * @simplewebauthn’s d.ts expects `string | string[]` and rejects readonly arrays.
 */
function makeExpectedOrigin(
  incoming: string[] | readonly string[] | undefined,
  fallbackMutable: string[]
): string[] {
  return incoming ? Array.from(incoming) : [...fallbackMutable]
}

/* =============================================================================
 * Service
 * ========================================================================== */

@Injectable()
export class WebAuthnService {
  /** Store the resolved, always-mutable config */
  private readonly cfg: ResolvedWebAuthnConfig

  constructor(
    @Optional() private readonly cache?: CacheRepository,
    @Optional() private readonly auditSvc?: AuditService,
    @Optional() private readonly store?: WebAuthnCredentialStore,
    opts?: Partial<WebAuthnServiceOptions>
  ) {
    // Resolve config with pragmatic dev defaults.
    const env = process.env
    const fallbackOrigin = env.WEBAUTHN_ORIGIN || 'http://localhost:3000'

    // Incoming may be readonly; copy into a **mutable** array.
    const incomingOrigins = (opts?.origins ??
      (env.WEBAUTHN_ORIGINS
        ? env.WEBAUTHN_ORIGINS.split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [fallbackOrigin])) as string[] | readonly string[]
    const originsMutable = Array.from(incomingOrigins)

    const rpID =
      opts?.rpID ?? env.WEBAUTHN_RP_ID ?? new URL(originsMutable[0]).hostname

    this.cfg = {
      rpName: opts?.rpName ?? env.WEBAUTHN_RP_NAME ?? 'Helix AI',
      rpID,
      origins: originsMutable, // <- mutable
      timeoutMs: opts?.timeoutMs ?? Number(env.WEBAUTHN_TIMEOUT_MS ?? 60_000),
      requireResidentKey:
        opts?.requireResidentKey ??
        env.WEBAUTHN_REQUIRE_RESIDENT_KEY === 'true',
      userVerification:
        opts?.userVerification ??
        (env.WEBAUTHN_USER_VERIFICATION as any) ??
        'preferred',
      challengeTtl: (opts?.challengeTtl ??
        Number(env.WEBAUTHN_CHALLENGE_TTL ?? 300)) as Seconds
    }

    // Soft sanity (log, don't throw) if RP ID doesn't suffix-match each origin host.
    for (const origin of this.cfg.origins) {
      const host = new URL(origin).hostname
      if (!(host === this.cfg.rpID || host.endsWith(`.${this.cfg.rpID}`))) {
        void audit(this.auditSvc, 'auth.webauthn.rpid_mismatch', {
          rpID: this.cfg.rpID,
          origin
        })
      }
    }
  }

  /* ----------------------------- Registration: begin ----------------------------- */

  /**
   * Create credential creation options; stash the challenge in Redis.
   * Exclude existing authenticators to discourage duplicates.
   */
  async generateRegistrationOptions(input: {
    userId: string
    username: string
    displayName?: string | null
    existing?: WebAuthnCredentialRecord[] | null
  }): Promise<PublicKeyCredentialCreationOptionsJSON> {
    // v13 expects base64url **string** IDs in exclusion list (no Buffers).
    const existing =
      input.existing ?? (await this.store?.findByUserId?.(input.userId)) ?? []
    const excludeCredentials = existing.map((c) => ({ id: c.credentialId }))

    const opts = await generateRegistrationOptions({
      rpName: this.cfg.rpName,
      rpID: this.cfg.rpID,
      userName: input.username,
      userID: utf8Bytes(input.userId), // bytes per spec
      userDisplayName: input.displayName ?? input.username,
      timeout: this.cfg.timeoutMs,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: this.cfg.requireResidentKey ? 'required' : 'preferred',
        userVerification: this.cfg.userVerification
      },
      supportedAlgorithmIDs: [-7, -257] // ES256, RS256
    })

    // Stash challenge as a **string** (opts.challenge may be bytes or string).
    const challengeStr =
      typeof opts.challenge === 'string'
        ? opts.challenge
        : toB64url(opts.challenge)
    if (this.cache) {
      await this.cache.set(
        kReg(input.userId),
        challengeStr,
        this.cfg.challengeTtl
      )
    }

    void audit(this.auditSvc, 'auth.webauthn.registration_options_issued', {
      userId: input.userId,
      excludeCount: excludeCredentials.length
    })

    return { ...opts, challenge: challengeStr }
  }

  /* ----------------------------- Registration: finish ---------------------------- */

  /**
   * Verify client attestation and return a normalized credential record.
   */
  async verifyRegistration(input: {
    userId: string
    response: RegistrationResponseJSON
    expectedOrigins?: string[] | readonly string[]
  }): Promise<
    | { verified: true; credential: WebAuthnCredentialRecord }
    | { verified: false; error: string }
  > {
    const expectedChallenge = this.cache
      ? await this.cache.get(kReg(input.userId))
      : null
    if (!expectedChallenge) {
      return {
        verified: false,
        error: 'registration_challenge_missing_or_expired'
      }
    }
    if (this.cache) {
      try {
        await this.cache.del(kReg(input.userId))
      } catch {
        /* ignore */
      }
    }

    // Ensure non-readonly `string | string[]` for verifier.
    const expectedOrigin = makeExpectedOrigin(
      input.expectedOrigins,
      this.cfg.origins
    )

    try {
      const { verified, registrationInfo } = await verifyRegistrationResponse({
        response: input.response,
        expectedChallenge, // string
        expectedOrigin, // string | mutable string[]
        expectedRPID: this.cfg.rpID,
        requireUserVerification: this.cfg.userVerification === 'required'
      })

      if (!verified || !registrationInfo) {
        return { verified: false, error: 'attestation_verification_failed' }
      }

      // v13: key material is under `registrationInfo.credential`
      const { credential, credentialBackedUp, credentialDeviceType, fmt } =
        registrationInfo

      // Normalize to base64url regardless of whether values come as bytes or strings.
      const credIdB64 =
        typeof credential.id === 'string'
          ? credential.id
          : toB64url(credential.id)
      const pubKeyB64 =
        typeof credential.publicKey === 'string'
          ? credential.publicKey
          : toB64url(credential.publicKey)

      const record: WebAuthnCredentialRecord = {
        userId: input.userId,
        credentialId: credIdB64,
        publicKey: pubKeyB64,
        counter: credential.counter ?? 0,
        transports: (input.response.response as any)?.transports ?? null,
        backupEligible: credentialDeviceType === 'multiDevice',
        backupState: credentialBackedUp
      }

      if (this.store?.upsert) {
        await this.store.upsert(record)
      }

      void audit(this.auditSvc, 'auth.webauthn.registration_verified', {
        userId: input.userId,
        deviceType: credentialDeviceType,
        fmt
      })

      return { verified: true, credential: record }
    } catch (err) {
      void audit(this.auditSvc, 'auth.webauthn.registration_error', {
        userId: input.userId,
        error: String(err)
      })
      return { verified: false, error: 'attestation_exception' }
    }
  }

  /* ---------------------------- Authentication: begin --------------------------- */

  /**
   * Create assertion request options; stash challenge in Redis.
   * If no allowlist is provided, discoverable credentials are allowed.
   */
  async generateAuthenticationOptions(input: {
    userId: string
    credentials?: WebAuthnCredentialRecord[] | null
  }): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const creds =
      input.credentials ??
      (await this.store?.findByUserId?.(input.userId)) ??
      []
    // v13: allowCredentials use base64url **string** IDs, no `type` field.
    const allowCredentials = creds.length
      ? creds.map((c) => ({ id: c.credentialId }))
      : undefined

    const opts = await generateAuthenticationOptions({
      rpID: this.cfg.rpID,
      timeout: this.cfg.timeoutMs,
      userVerification: this.cfg.userVerification,
      allowCredentials
    })

    const challengeStr =
      typeof opts.challenge === 'string'
        ? opts.challenge
        : toB64url(opts.challenge)
    if (this.cache) {
      await this.cache.set(
        kAuth(input.userId),
        challengeStr,
        this.cfg.challengeTtl
      )
    }

    void audit(this.auditSvc, 'auth.webauthn.authentication_options_issued', {
      userId: input.userId,
      allowCount: allowCredentials?.length ?? 0
    })

    return { ...opts, challenge: challengeStr }
  }

  /* ---------------------------- Authentication: finish -------------------------- */

  /**
   * Verify an assertion and update the authenticator counter in the store.
   */
  async verifyAuthentication(input: {
    userId: string
    response: AuthenticationResponseJSON
    credential?: WebAuthnCredentialRecord | null
    expectedOrigins?: string[] | readonly string[]
  }): Promise<
    | { verified: true; credentialId: string; newCounter: number }
    | { verified: false; error: string }
  > {
    const expectedChallenge = this.cache
      ? await this.cache.get(kAuth(input.userId))
      : null
    if (!expectedChallenge) {
      return {
        verified: false,
        error: 'authentication_challenge_missing_or_expired'
      }
    }
    if (this.cache) {
      try {
        await this.cache.del(kAuth(input.userId))
      } catch {
        /* ignore */
      }
    }

    // The browser’s `id` is base64url; use it to find the stored record.
    const credentialIdB64 = String(
      input.response.id || input.response.rawId || ''
    )
    const cred =
      input.credential ??
      (this.store?.findByCredentialId
        ? await this.store.findByCredentialId(credentialIdB64)
        : null)

    if (!cred) return { verified: false, error: 'credential_not_found' }

    // Ensure non-readonly `string | string[]` for verifier.
    const expectedOrigin = makeExpectedOrigin(
      input.expectedOrigins,
      this.cfg.origins
    )

    try {
      // Some v13.x d.ts drop `authenticator` from the options type even though
      // the runtime requires it. Use a safe cast to keep TS happy across ranges.
      const baseOpts = {
        response: input.response,
        expectedChallenge, // string
        expectedOrigin, // string | mutable string[]
        expectedRPID: this.cfg.rpID,
        requireUserVerification: this.cfg.userVerification === 'required'
      }
      const optsWithAuthenticator: any = {
        ...baseOpts,
        authenticator: {
          credentialID: fromB64url(cred.credentialId),
          credentialPublicKey: fromB64url(cred.publicKey),
          counter: cred.counter ?? 0
        }
      }

      const { verified, authenticationInfo } =
        await verifyAuthenticationResponse(optsWithAuthenticator)

      if (!verified || !authenticationInfo) {
        return { verified: false, error: 'assertion_verification_failed' }
      }

      const { newCounter } = authenticationInfo
      if (this.store?.updateCounter) {
        await this.store.updateCounter(cred.credentialId, newCounter)
      }

      void audit(this.auditSvc, 'auth.webauthn.authentication_verified', {
        userId: input.userId,
        credentialId: cred.credentialId,
        newCounter
      })

      return { verified: true, credentialId: cred.credentialId, newCounter }
    } catch (err) {
      void audit(this.auditSvc, 'auth.webauthn.authentication_error', {
        userId: input.userId,
        error: String(err)
      })
      return { verified: false, error: 'assertion_exception' }
    }
  }
}
