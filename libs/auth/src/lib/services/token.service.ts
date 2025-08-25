// libs/auth/src/lib/services/token.service.ts
// -----------------------------------------------------------------------------
// TokenService (with audit events via @helixai/audit)
// -----------------------------------------------------------------------------
// Responsibilities
//   • Mint access & refresh JWTs
//   • Verify access/refresh JWTs (issuer/audience/clock skew)
//   • Denylist by JTI (Redis) + refresh rotation with reuse detection
//   • Emit audit events for key lifecycle moments (mint/rotate/reuse/revoke)
//
// Config shape: flat (algorithm, issuer, audience/audiences, clockSkewSeconds,
// accessTtlSeconds, refreshTtlSeconds, refreshFamilyTtlSeconds)
//
// Keys loaded from env by default (HS secret or RS/ES PEMs).
// -----------------------------------------------------------------------------

import { Injectable, Inject, Logger, Optional } from '@nestjs/common'
import {
  SignJWT,
  jwtVerify,
  decodeProtectedHeader,
  importPKCS8,
  importSPKI,
  type JWTPayload
} from 'jose'

import { authConfig, type AuthConfig } from '../config/auth.config'
import {
  RedisTokenAdapter,
  type RefreshFamilyState
} from '../adapters/redis-token.adapter'
import {
  mintAccessWithMeta,
  mintRefreshWithMeta
} from './helpers/claims.helper'

import type {
  AccessTokenPayload,
  RefreshTokenPayload,
  JwtString,
  Subject,
  Jti
} from '../types/token.types'
import type { Seconds } from '@helixai/redis'

// Optional audit integration (keep lightweight & non-blocking)
import type { AuditService } from '@helixai/audit'

// Small utility to avoid repeated string checks
const isNonEmpty = (s?: string | null): s is string =>
  !!s && s.trim().length > 0

// Resolve audience option for jose: prefer array if provided, else single string.
function cfgAudience(cfg: AuthConfig): string | string[] | undefined {
  if (Array.isArray(cfg.audiences) && cfg.audiences.length > 0)
    return cfg.audiences
  return cfg.audience || undefined
}

// Minimal “duck type” so we can support different audit service method names.
type AuditLike = {
  emit?(event: string, data?: any): unknown | Promise<unknown>
  record?(event: string, data?: any): unknown | Promise<unknown>
  log?(event: string, data?: any): unknown | Promise<unknown>
}

/* -----------------------------------------------------------------------------
 * TokenService
 * -------------------------------------------------------------------------- */

@Injectable()
export class TokenService {
  private readonly log = new Logger(TokenService.name)

  constructor(
    @Inject(authConfig.KEY) private readonly cfg: AuthConfig,
    @Optional() private readonly redis?: RedisTokenAdapter,
    @Optional() private readonly audit?: AuditService | AuditLike
  ) {}

  // ────────────────────────────── Public API ──────────────────────────────

  /** Mint an ACCESS token (returns token + payload + timing for cookies). */
  async mintAccess(params: {
    subject: Subject
    scopes?: string[]
    orgId?: string
    sessionId?: string
    version?: number
  }): Promise<{
    token: JwtString
    payload: AccessTokenPayload
    iat: number
    exp: number
  }> {
    const { subject, scopes, orgId, sessionId, version } = params

    const { payload, meta } = mintAccessWithMeta({
      subject,
      issuer: this.cfg.issuer,
      audience: cfgAudience(this.cfg),
      ttlSeconds: this.cfg.accessTtlSeconds,
      clockSkewSeconds: this.cfg.clockSkewSeconds ?? 0,
      scopes,
      orgId,
      sessionId,
      version
    })

    const token = await this.sign(payload, this.cfg.algorithm)

    // ─ Audit: token minted (access)
    this.auditEvent('auth.token.minted', {
      typ: 'access',
      sub: payload.sub,
      org: payload.org ?? null,
      sid: payload.sid ?? null,
      jti: payload.jti,
      iat: payload.iat,
      exp: payload.exp,
      scopes: payload.scope ?? null,
      alg: this.cfg.algorithm
    })

    return {
      token: token as JwtString,
      payload,
      iat: meta.issuedAt,
      exp: meta.expiresAt
    }
  }

  /** Mint a REFRESH token and persist/advance refresh-family state in Redis. */
  async mintRefresh(params: {
    subject: Subject
    orgId?: string
    sessionId: string
    version?: number
  }): Promise<{
    token: JwtString
    payload: RefreshTokenPayload
    iat: number
    exp: number
  }> {
    const { subject, orgId, sessionId, version } = params

    const { payload, meta } = mintRefreshWithMeta({
      subject,
      issuer: this.cfg.issuer,
      audience: cfgAudience(this.cfg),
      ttlSeconds: this.cfg.refreshTtlSeconds,
      clockSkewSeconds: this.cfg.clockSkewSeconds ?? 0,
      orgId,
      sessionId,
      version
    })

    const token = await this.sign(payload, this.cfg.algorithm)

    if (this.redis) {
      const rid = (payload.rid as string | undefined) ?? (payload.jti as string)
      const nowIso = new Date(meta.issuedAt * 1000).toISOString()
      const familyTtl = (this.cfg.refreshFamilyTtlSeconds ??
        this.cfg.refreshTtlSeconds) as Seconds

      const family: RefreshFamilyState = {
        sub: payload.sub as string,
        sid: payload.sid as string,
        activeRid: rid,
        activeJti: payload.jti as string,
        createdAt: nowIso,
        lastRotatedAt: nowIso
      }

      await this.redis.putRefreshFamily(
        family.sub,
        family.sid,
        family,
        familyTtl
      )
      await this.redis.indexRefreshRid(rid, family.sub, family.sid, familyTtl)
    }

    // ─ Audit: token minted (refresh)
    this.auditEvent('auth.token.minted', {
      typ: 'refresh',
      sub: payload.sub,
      org: payload.org ?? null,
      sid: payload.sid ?? null,
      jti: payload.jti,
      rid: payload.rid ?? payload.jti,
      iat: payload.iat,
      exp: payload.exp,
      alg: this.cfg.algorithm
    })

    return {
      token: token as JwtString,
      payload,
      iat: meta.issuedAt,
      exp: meta.expiresAt
    }
  }

  /**
   * Rotate a valid REFRESH token:
   *   • Verifies the RT
   *   • Detects *reuse* via Redis family state; on reuse → denylist & error
   *   • On success → returns fresh { access, refresh } pair
   */
  async rotateRefresh(
    refreshToken: JwtString,
    opts?: { scopes?: string[]; orgId?: string }
  ) {
    const { payload } = await this.verify(refreshToken, 'refresh')

    if (this.redis) {
      const sid = payload.sid as string
      const rid = (payload.rid as string | undefined) ?? (payload.jti as string)
      const sub = payload.sub as string

      const state = await this.redis.getRefreshFamily(sub, sid)
      if (!state || state.revoked) {
        await this.safeDenyJti(
          payload.jti as string,
          this.cfg.refreshTtlSeconds as Seconds
        )
        // ─ Audit: reuse detected (no active family)
        this.auditEvent('auth.token.refresh_reuse_detected', {
          reason: 'no_active_family',
          sub,
          sid,
          jti: payload.jti,
          rid
        })
        throw new Error('refresh_reuse_detected')
      }
      if (state.activeRid && state.activeRid !== rid) {
        await this.safeDenyJti(
          payload.jti as string,
          this.cfg.refreshTtlSeconds as Seconds
        )
        state.revoked = true
        await this.redis.putRefreshFamily(
          sub,
          sid,
          state,
          (this.cfg.refreshFamilyTtlSeconds ??
            this.cfg.refreshTtlSeconds) as Seconds
        )
        // ─ Audit: reuse detected (rid mismatch)
        this.auditEvent('auth.token.refresh_reuse_detected', {
          reason: 'rid_mismatch',
          sub,
          sid,
          expectedRid: state.activeRid,
          presentedRid: rid,
          jti: payload.jti
        })
        throw new Error('refresh_reuse_detected')
      }
    }

    const access = await this.mintAccess({
      subject: payload.sub as Subject,
      scopes: opts?.scopes,
      orgId: opts?.orgId ?? (payload.org as string | undefined),
      sessionId: payload.sid as string | undefined,
      version: payload.ver as number | undefined
    })

    const nextRefresh = await this.mintRefresh({
      subject: payload.sub as Subject,
      orgId: opts?.orgId ?? (payload.org as string | undefined),
      sessionId: payload.sid as string,
      version: payload.ver as number | undefined
    })

    // Best-effort: denylist prior RT jti
    await this.safeDenyJti(
      payload.jti as string,
      this.cfg.refreshTtlSeconds as Seconds
    )

    // ─ Audit: refresh rotated
    this.auditEvent('auth.token.refresh_rotated', {
      sub: payload.sub,
      sid: payload.sid,
      prevJti: payload.jti,
      prevRid: payload.rid ?? payload.jti,
      nextJti: nextRefresh.payload.jti,
      nextRid: nextRefresh.payload.rid ?? nextRefresh.payload.jti
    })

    return {
      access: {
        token: access.token,
        payload: access.payload,
        iat: access.iat,
        exp: access.exp
      },
      refresh: {
        token: nextRefresh.token,
        payload: nextRefresh.payload,
        iat: nextRefresh.iat,
        exp: nextRefresh.exp
      }
    }
  }

  /** Denylist a JWT JTI for the provided TTL (seconds). */
  async denylistJti(jti: Jti, ttlSeconds: Seconds): Promise<void> {
    await this.safeDenyJti(jti, ttlSeconds)
    // ─ Audit: token revoked (denylisted)
    this.auditEvent('auth.token.revoked', { jti, ttlSeconds })
  }

  /** Verify ACCESS token (signature, standard claims, type, and optional denylist). */
  async verifyAccess(token: JwtString): Promise<AccessTokenPayload> {
    const { payload } = await this.verify(token, 'access')
    if (this.redis && isNonEmpty(payload.jti)) {
      const denied = await this.redis.isJwtDenied(payload.jti)
      if (denied) {
        // ─ Audit: verification rejected due to denylist
        this.auditEvent('auth.token.verification_failed', {
          typ: 'access',
          reason: 'denylisted',
          jti: payload.jti,
          sub: payload.sub ?? null
        })
        throw new Error('token_revoked')
      }
    }
    return payload as AccessTokenPayload
  }

  /** Verify REFRESH token (plus optional denylist check). */
  async verifyRefresh(
    token: JwtString
  ): Promise<{ subject: Subject; payload: RefreshTokenPayload }> {
    const { payload } = await this.verify(token, 'refresh')
    if (this.redis && isNonEmpty(payload.jti)) {
      const denied = await this.redis.isJwtDenied(payload.jti)
      if (denied) {
        // ─ Audit: verification rejected due to denylist
        this.auditEvent('auth.token.verification_failed', {
          typ: 'refresh',
          reason: 'denylisted',
          jti: payload.jti,
          sub: payload.sub ?? null
        })
        throw new Error('token_revoked')
      }
    }
    return {
      subject: (payload.sub as Subject) ?? ('' as Subject),
      payload: payload as RefreshTokenPayload
    }
  }

  // ─────────────────────────── Internal helpers ───────────────────────────

  /** Centralized audit call that never throws or blocks the flow. */
  private async auditEvent(event: string, data?: Record<string, unknown>) {
    if (!this.audit) return
    try {
      const a: any = this.audit
      if (typeof a.emit === 'function') await a.emit(event, data)
      else if (typeof a.record === 'function') await a.record(event, data)
      else if (typeof a.log === 'function') await a.log(event, data)
    } catch {
      // swallow — auditing must not impact the auth hot path
    }
  }

  /** Best-effort JTI denylist write (no throw if Redis missing/fails). */
  private async safeDenyJti(jti: string, ttl: Seconds): Promise<void> {
    try {
      if (this.redis) await this.redis.denylistJwt(jti, ttl)
    } catch {
      this.log.debug(`denylist write failed for jti=${jti}`)
    }
  }

  /** Sign a payload with configured algorithm/key. */
  private async sign(
    payload: AccessTokenPayload | RefreshTokenPayload,
    alg: string
  ): Promise<string> {
    const key: any = await this.getSigningKey(alg)
    const builder = new SignJWT(
      payload as unknown as JWTPayload
    ).setProtectedHeader({ alg })
    return builder.sign(key)
  }

  /** Verify a JWT and enforce alg/type/issuer/audience/clock tolerance. */
  private async verify<T extends 'access' | 'refresh'>(
    token: JwtString,
    expectedTyp: T
  ): Promise<{
    payload: (T extends 'access' ? AccessTokenPayload : RefreshTokenPayload) &
      JWTPayload
  }> {
    const header = decodeProtectedHeader(token)
    const alg = header.alg
    if (!alg) throw new Error('missing_alg')

    const key: any = await this.getVerifyKey(alg)

    const res = await jwtVerify(token, key, {
      issuer: this.cfg.issuer,
      audience: cfgAudience(this.cfg),
      algorithms: [alg],
      clockTolerance: this.cfg.clockSkewSeconds ?? 0 // seconds
    })
    const payload = res.payload as any

    if (payload.typ !== expectedTyp) {
      // ─ Audit: verification failed due to typ mismatch
      this.auditEvent('auth.token.verification_failed', {
        reason: 'invalid_token_type',
        expected: expectedTyp,
        got: payload.typ ?? null,
        sub: payload.sub ?? null,
        jti: payload.jti ?? null
      })
      throw new Error('invalid_token_type')
    }

    return { payload }
  }

  /* ------------------------------ Key loading ------------------------------ */

  /** Resolve a signing key for the given algorithm. */
  private async getSigningKey(alg: string): Promise<any> {
    const isHS = alg.startsWith('HS')
    const isRSorES = alg.startsWith('RS') || alg.startsWith('ES')

    if (isHS) {
      const secret = process.env.AUTH_JWT_SECRET || process.env.JWT_SECRET
      if (!isNonEmpty(secret)) throw new Error('missing_jwt_secret')
      return Buffer.from(secret, 'utf8')
    }

    if (isRSorES) {
      const pem = process.env.AUTH_PRIVATE_KEY_PEM
      if (!isNonEmpty(pem)) throw new Error('missing_private_key_pem')
      return importPKCS8(pem, alg)
    }

    throw new Error(`unsupported_alg: ${alg}`)
  }

  /** Resolve a verification key. For asymmetric algs, prefer `AUTH_PUBLIC_KEY_PEM`. */
  private async getVerifyKey(alg: string): Promise<any> {
    const isHS = alg.startsWith('HS')
    const isRSorES = alg.startsWith('RS') || alg.startsWith('ES')

    if (isHS) {
      const secret = process.env.AUTH_JWT_SECRET || process.env.JWT_SECRET
      if (!isNonEmpty(secret)) throw new Error('missing_jwt_secret')
      return Buffer.from(secret, 'utf8')
    }

    if (isRSorES) {
      const spki = process.env.AUTH_PUBLIC_KEY_PEM
      if (!isNonEmpty(spki)) throw new Error('missing_public_key_pem')
      return importSPKI(spki, alg)
    }

    throw new Error(`unsupported_alg: ${alg}`)
  }
}

/* -----------------------------------------------------------------------------
 * Provider binding for guards/strategy
 * -------------------------------------------------------------------------- */
export const TokenServiceVerifierProvider = {
  provide: 'AUTH_TOKEN_VERIFIER', // or import { AUTH_TOKEN_VERIFIER } from your guard
  useExisting: TokenService
}
