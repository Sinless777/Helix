// libs/auth/src/lib/services/jwks.service.ts
// -----------------------------------------------------------------------------
// JWKSService — Manage JSON Web Keys (signing/verification) and expose JWKS
// -----------------------------------------------------------------------------
// Features
//   • Load keys from environment PEMs (RS*/ES*) or generate fresh ones
//   • Optional Redis persistence for multi-instance sharing
//   • Active key tracking (kid) with rotation helpers
//   • Export public JWKS for /.well-known/jwks.json
//   • Provide jose-compatible keys for SignJWT/jwtVerify via importJWK/import*
//
// Note on types:
//   We avoid `KeyLike` in the public/return types because some `jose` versions
//   don’t export it; we return `any` for the key to keep compatibility.
// -----------------------------------------------------------------------------

import { Injectable, Inject, Logger, Optional } from '@nestjs/common'
import {
  calculateJwkThumbprint,
  exportJWK,
  generateKeyPair,
  importJWK,
  importPKCS8,
  importSPKI,
  JWK
} from 'jose'

import { authConfig, type AuthConfig } from '../config/auth.config'

// Optional Redis persistence (best for multi-instance)
import type { CacheRepository } from '@helixai/redis'

// Where we keep the document + pointer in Redis (if provided)
const REDIS_JWKS_KEY = 'helix:auth:jwks'
const REDIS_JWKS_ACTIVE_KID_KEY = 'helix:auth:jwks:active_kid'

// We store both private & public JWKs in memory / Redis. Only expose public in JWKS.
export interface ManagedJwk {
  kid: string
  alg: string
  // RFC 7517 JWKs (private/public). Do not expose private outward.
  privateJwk: JWK
  publicJwk: JWK
  createdAt: string // ISO timestamp
  notBefore?: string // ISO (optional)
  notAfter?: string // ISO (optional)
}

// Public JWKS shape for /.well-known/jwks.json
export interface JwksDocument {
  keys: Array<JWK & { kid: string; alg: string; use?: 'sig' | 'enc' }>
}

/** Map JOSE alg → curve/modulus options. Extend as needed. */
function algOptions(alg: string, cfg: AuthConfig) {
  // Use camelCase per your config type; default to 2048 for RSA
  const modLen = Number(cfg?.jwks?.modulusLength ?? 2048) || 2048

  if (alg.startsWith('RS'))
    return { kty: 'RSA' as const, modulusLength: modLen }
  if (alg === 'ES256') return { kty: 'EC' as const, crv: 'P-256' as const }
  if (alg === 'ES384') return { kty: 'EC' as const, crv: 'P-384' as const }
  if (alg === 'ES512') return { kty: 'EC' as const, crv: 'P-521' as const }
  if (alg === 'EdDSA') return { kty: 'OKP' as const, crv: 'Ed25519' as const }
  throw new Error(`jwks_unsupported_alg: ${alg}`)
}

/** Compute a stable kid: prefer env-provided, else JWK thumbprint. */
async function computeKid(pubJwk: JWK, preferredKid?: string): Promise<string> {
  if (preferredKid && preferredKid.trim()) return preferredKid.trim()
  const thumb = await calculateJwkThumbprint(pubJwk)
  return thumb
}

@Injectable()
export class JwksService {
  private readonly log = new Logger(JwksService.name)
  /** In-memory keystore by kid. */
  private store = new Map<string, ManagedJwk>()
  /** The currently active kid used for signing. */
  private activeKid: string | null = null

  constructor(
    @Inject(authConfig.KEY) private readonly cfg: AuthConfig,
    @Optional() private readonly cache?: CacheRepository
  ) {}

  // ───────────────────────── Initialization / Loading ─────────────────────────

  /**
   * Initialize keystore from Redis (if available) or environment (PEMs),
   * otherwise generate a fresh keypair for cfg.algorithm.
   */
  async init(): Promise<void> {
    // 1) Try Redis-backed state first
    if (this.cache) {
      try {
        const [doc, active] = await Promise.all([
          this.cache.getJSON<
            JwksDocument & { privateKeys?: Record<string, JWK> }
          >(REDIS_JWKS_KEY),
          this.cache.get(REDIS_JWKS_ACTIVE_KID_KEY)
        ])
        if (doc?.keys?.length && active) {
          // Rehydrate memory store
          for (const pub of doc.keys) {
            const priv =
              (doc as any).privateKeys?.[pub.kid as string] ??
              null /* could be null if you chose not to store privates */
            if (!priv) continue // skip incomplete entries
            this.store.set(pub.kid as string, {
              kid: pub.kid as string,
              alg: pub.alg as string,
              publicJwk: pub,
              privateJwk: priv,
              createdAt: new Date().toISOString()
            })
          }
          if (this.store.size > 0) {
            this.activeKid = active
            this.log.log(
              `JWKS initialized from Redis (keys=${this.store.size})`
            )
            return
          }
        }
      } catch (e) {
        this.log.warn(`JWKS Redis init failed: ${String(e)}`)
      }
    }

    // 2) Try environment PEMs for asymmetric algorithms
    if (this.hasEnvKeyMaterial()) {
      await this.loadFromEnv()
      this.log.log('JWKS initialized from environment PEMs')
      // Persist to Redis for other instances (best-effort)
      await this.persistToRedis().catch(() => void 0)
      return
    }

    // 3) Generate a fresh keypair for configured algorithm
    await this.generateAndActivate(this.cfg.algorithm)
    this.log.log(`JWKS generated new keypair for alg=${this.cfg.algorithm}`)
    await this.persistToRedis().catch(() => void 0)
  }

  // ─────────────────────────────── Public API ───────────────────────────────

  /** Return the public JWKS document for publishing at /.well-known/jwks.json */
  getPublicJwks(): JwksDocument {
    const keys: JwksDocument['keys'] = []
    for (const { publicJwk, kid, alg } of this.store.values()) {
      keys.push({ ...publicJwk, kid, alg, use: 'sig' })
    }
    return { keys }
  }

  /** Return current active kid (used for signing). */
  getActiveKid(): string | null {
    return this.activeKid
  }

  /**
   * Get a **signing** key for the active kid (or a requested kid).
   * Returns a key object compatible with `jose` SignJWT (typed as `any` to
   * avoid version-specific `KeyLike` typing).
   */
  async getSigningKeyForKid(
    kid?: string
  ): Promise<{ key: any; kid: string; alg: string }> {
    const chosenKid = kid ?? this.activeKid ?? ''
    const m = this.store.get(chosenKid)
    if (!m) throw new Error(`jwks_signing_key_not_found: kid=${chosenKid}`)
    const key = await importJWK(m.privateJwk, m.alg)
    return { key, kid: m.kid, alg: m.alg }
  }

  /**
   * Get a **verification** key for a given kid.
   * Returns a key object compatible with `jose` jwtVerify (typed as `any`).
   */
  async getVerifyKeyForKid(
    kid: string
  ): Promise<{ key: any; kid: string; alg: string }> {
    const m = this.store.get(kid)
    if (!m) throw new Error(`jwks_verify_key_not_found: kid=${kid}`)
    const key = await importJWK(m.publicJwk, m.alg)
    return { key, kid: m.kid, alg: m.alg }
  }

  /** Rotate the active keypair (generate new, set active, keep old for verification). */
  async rotate(): Promise<{ kid: string; alg: string }> {
    const { kid, alg } = await this.generateAndActivate(this.cfg.algorithm)
    await this.persistToRedis().catch(() => void 0)
    return { kid, alg }
  }

  /**
   * Check if rotation is due based on cfg.jwks.rotationDays.
   * If due, rotate. Returns true if rotation happened.
   */
  async rotateIfDue(): Promise<boolean> {
    const days = Number(this.cfg?.jwks?.rotationDays ?? 0)
    if (!days || !this.activeKid) return false
    const m = this.store.get(this.activeKid)
    if (!m) return false
    const ageMs = Date.now() - new Date(m.createdAt).getTime()
    const thresholdMs = days * 24 * 3600 * 1000
    if (ageMs >= thresholdMs) {
      await this.rotate()
      return true
    }
    return false
  }

  /** Remove an old key by kid (useful when you want to retire a compromised key). */
  async removeKid(kid: string): Promise<void> {
    // Never remove the active kid via this call.
    if (kid === this.activeKid) throw new Error('cannot_remove_active_kid')
    this.store.delete(kid)
    await this.persistToRedis().catch(() => void 0)
  }

  // ───────────────────────────── Internal helpers ─────────────────────────────

  /** Do we have PEMs in env for asymmetric algorithms? */
  private hasEnvKeyMaterial(): boolean {
    const priv = process.env.AUTH_PRIVATE_KEY_PEM
    const pub = process.env.AUTH_PUBLIC_KEY_PEM
    return Boolean(priv && pub)
  }

  /**
   * Load asymmetric keys from env PEMs, convert to JWKs, set active kid.
   * ENV:
   *   AUTH_PRIVATE_KEY_PEM (PKCS#8)
   *   AUTH_PUBLIC_KEY_PEM  (SPKI)
   *   AUTH_JWT_ALG         (must match key type, e.g., RS256, ES256)
   *   AUTH_JWT_KID         (optional; otherwise thumbprint used)
   */
  private async loadFromEnv(): Promise<void> {
    const alg = this.cfg.algorithm
    const privPem = process.env.AUTH_PRIVATE_KEY_PEM
    const pubPem = process.env.AUTH_PUBLIC_KEY_PEM
    if (!privPem || !pubPem) throw new Error('jwks_missing_env_pems')

    // Import PEMs into KeyLike then export as JWKs to normalize shape
    const [privKey, pubKey] = await Promise.all([
      importPKCS8(privPem, alg),
      importSPKI(pubPem, alg)
    ])
    const [privJwk, pubJwk] = await Promise.all([
      exportJWK(privKey),
      exportJWK(pubKey)
    ])

    const kid = await computeKid(pubJwk, process.env.AUTH_JWT_KID)
    const now = new Date().toISOString()

    this.store.set(kid, {
      kid,
      alg,
      privateJwk: privJwk,
      publicJwk: pubJwk,
      createdAt: now
    })
    this.activeKid = kid
  }

  /**
   * Generate a fresh keypair for a given algorithm and set it active.
   * For RS*, uses cfg.jwks.modulusLength (default 2048).
   * For ES256/384/512 and EdDSA, selects the appropriate curve.
   */
  private async generateAndActivate(
    alg: string
  ): Promise<{ kid: string; alg: string }> {
    const opts = algOptions(alg, this.cfg)

    // jose.generateKeyPair handles the right key type/curve/modulus
    const { privateKey, publicKey } = await generateKeyPair(alg, {
      ...(opts.kty === 'RSA' ? { modulusLength: opts.modulusLength } : {})
      // jose infers EC/OKP curves from `alg`
    } as any)

    const [privJwk, pubJwk] = await Promise.all([
      exportJWK(privateKey),
      exportJWK(publicKey)
    ])
    const kid = await computeKid(pubJwk, process.env.AUTH_JWT_KID)

    this.store.set(kid, {
      kid,
      alg,
      privateJwk: privJwk,
      publicJwk: pubJwk,
      createdAt: new Date().toISOString()
    })
    this.activeKid = kid
    return { kid, alg }
  }

  /**
   * Persist current keystore to Redis so other instances can rehydrate.
   * We write:
   *   - helix:auth:jwks             → { keys: [publicJwk...] , privateKeys: { [kid]: privateJwk } }
   *   - helix:auth:jwks:active_kid  → active kid string
   *
   * NOTE: You can remove `privateKeys` if you prefer not to store private
   * material in Redis, and rely solely on PEMs/KMS for private retrieval.
   */
  private async persistToRedis(): Promise<void> {
    if (!this.cache) return
    const keys = Array.from(this.store.values())
    const pub: JwksDocument = {
      keys: keys.map(({ publicJwk, kid, alg }) => ({
        ...publicJwk,
        kid,
        alg,
        use: 'sig'
      }))
    }
    const privateKeys: Record<string, JWK> = {}
    for (const k of keys) privateKeys[k.kid] = k.privateJwk

    await this.cache.setJSON(REDIS_JWKS_KEY, { ...pub, privateKeys })
    if (this.activeKid)
      await this.cache.set(REDIS_JWKS_ACTIVE_KID_KEY, this.activeKid)
  }
}
