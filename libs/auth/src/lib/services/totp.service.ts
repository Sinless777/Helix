// libs/auth/src/lib/services/totp.service.ts
// -----------------------------------------------------------------------------
// TOTPService — enroll & verify Time-based One-Time Passwords
// -----------------------------------------------------------------------------
// Supports:
//   • Enrollment (start → confirm), with short-lived secret in Redis
//   • Verification for sign-in
//   • Rate limiting (via a duck-typed rate-limit repo when available)
//   • Audit events using @helixai/audit
//
// Notes on typing fixes:
//   • otplib's type defs may not include `window` on `totp.verify`. We call it
//     through an `any` cast so we can still pass `window` at runtime.
//   • Your RateLimitRepository type doesn't expose `consume`. We accept any
//     object that *optionally* implements `consume`, `hit`, or `check`.
// -----------------------------------------------------------------------------

import { Injectable, Inject, Optional } from '@nestjs/common'
import { authenticator, totp } from 'otplib'

import { authConfig, type AuthConfig } from '../config/auth.config'

// Redis pieces from your workspace library
import type { CacheRepository, Seconds } from '@helixai/redis'

// Optional audit integration
import type { AuditService } from '@helixai/audit'

// ─────────────────────────────── Types & options ─────────────────────────────

/** Runtime options for TOTP behavior (defaults provided; can be overridden). */
export interface TotpOptions {
  /** Code step/period in seconds (default: 30s). */
  step?: number
  /** Number of digits (default: 6). */
  digits?: 6 | 7 | 8
  /**
   * Verification “window” (how many time steps to either side we accept).
   * Be conservative; default: 1 (current, previous, next).
   */
  window?: number
  /**
   * Enrollment secret TTL in Redis (seconds). Keep short (default: 10 minutes).
   * After TTL expiry, the pending enrollment is abandoned.
   */
  enrollTtlSeconds?: Seconds
  /**
   * Rate limit: max attempts per window when verifying codes (sign-in / confirm).
   * Defaults: 5 attempts per 60 seconds.
   */
  rlMaxAttempts?: number
  rlWindowSeconds?: Seconds
}

/** Response from enrollment start (hand to the client to display QR/code). */
export interface TotpEnrollmentStart {
  secret: string // base32 secret
  otpauthUri: string // for QR
  label: string // shown in app (e.g., email)
  issuer: string // your product/app name
  expiresIn: Seconds // seconds remaining for pending enrollment
}

// ─────────────────────────────── Key namespaces ──────────────────────────────

/** Redis key for a user’s *pending enrollment* secret. */
function kEnrollSecret(userId: string) {
  return `mfa:totp:enroll:${userId}`
}

/** Redis key to rate-limit verification attempts. */
function kVerifyRatelimit(userId: string) {
  return `mfa:totp:verify:${userId}`
}

// ─────────────────────────────── Audit helper ────────────────────────────────

type AuditLike = {
  emit?(event: string, data?: any): unknown | Promise<unknown>
  record?(event: string, data?: any): unknown | Promise<unknown>
  log?(event: string, data?: any): unknown | Promise<unknown>
}

async function audit(
  auditSvc: AuditService | AuditLike | undefined,
  event: string,
  data?: any
) {
  if (!auditSvc) return
  try {
    const a: any = auditSvc
    if (typeof a.emit === 'function') await a.emit(event, data)
    else if (typeof a.record === 'function') await a.record(event, data)
    else if (typeof a.log === 'function') await a.log(event, data)
  } catch {
    // swallow — MFA must not be blocked by audit sink failures
  }
}

// ───────────────────────────── Rate-limit duck type ──────────────────────────
// We don't rely on a specific class signature. If an injected repo exposes
// one of these methods, we'll use it. Otherwise, we allow the attempt.

type RateLimitLike = {
  // Preferred: returns details about the decision.
  consume?(
    key: string,
    opts: { limit: number; ttlSeconds: Seconds }
  ): Promise<{ allowed: boolean; remaining?: number; resetIn?: number }>

  // Alternative #1: returns boolean allowed/blocked.
  hit?(
    key: string,
    opts: { limit: number; ttlSeconds: Seconds }
  ): Promise<boolean>

  // Alternative #2: generic check method with similar semantics.
  check?(
    key: string,
    opts: { limit: number; ttlSeconds: Seconds }
  ): Promise<
    { allowed: boolean; remaining?: number; resetIn?: number } | boolean
  >
}

// ────────────────────────────────── Service ──────────────────────────────────

@Injectable()
export class TotpService {
  /** Default runtime options (sane & conservative). */
  private readonly defaults: Required<TotpOptions> = {
    step: 30,
    digits: 6,
    window: 1,
    enrollTtlSeconds: (10 * 60) as Seconds, // 10 minutes
    rlMaxAttempts: 5,
    rlWindowSeconds: 60 as Seconds // 1 minute
  }

  constructor(
    @Inject(authConfig.KEY) private readonly cfg: AuthConfig,
    @Optional() private readonly cache?: CacheRepository,
    // note: typed as RateLimitLike (duck type) to avoid hard dependency on a specific signature
    @Optional() private readonly rateLimit?: RateLimitLike,
    @Optional() private readonly auditSvc?: AuditService | AuditLike
  ) {}

  // ───────────────────────────── Enrollment flow ─────────────────────────────

  /**
   * Start enrollment: generate a base32 secret + otpauth URI, stash secret in Redis
   * for a short TTL so the user can confirm with a valid TOTP code.
   */
  async startEnrollment(
    userId: string,
    label: string,
    opts?: TotpOptions
  ): Promise<TotpEnrollmentStart> {
    const o = { ...this.defaults, ...(opts ?? {}) }

    // Configure authenticator for base32 & URI generation.
    authenticator.options = { step: o.step, digits: o.digits }

    // Create a new base32 secret the user's app will store locally.
    const secret = authenticator.generateSecret()

    // Compose issuer/label (most apps display "issuer: label").
    const issuer = this.cfg.issuer || 'Helix AI'
    const otpauthUri = authenticator.keyuri(label, issuer, secret)

    // Persist the *pending* secret in Redis (short-lived).
    if (this.cache) {
      await this.cache.setJSON(
        kEnrollSecret(userId),
        { secret, step: o.step, digits: o.digits },
        o.enrollTtlSeconds
      )
    }

    await audit(this.auditSvc, 'auth.mfa.totp.enroll_started', {
      userId,
      issuer,
      label,
      ttl: o.enrollTtlSeconds
    })

    return { secret, otpauthUri, label, issuer, expiresIn: o.enrollTtlSeconds }
  }

  /**
   * Confirm enrollment: verify a code against the *pending* secret in Redis.
   * On success: returns the secret so the caller can persist it in DB.
   * On failure: returns `null`.
   */
  async confirmEnrollment(
    userId: string,
    code: string,
    opts?: TotpOptions
  ): Promise<{ secret: string } | null> {
    const o = { ...this.defaults, ...(opts ?? {}) }
    const pending = this.cache
      ? await this.cache.getJSON<{
          secret: string
          step?: number
          digits?: number
        }>(kEnrollSecret(userId))
      : null

    if (!pending?.secret) {
      await audit(this.auditSvc, 'auth.mfa.totp.enroll_confirm_failed', {
        userId,
        reason: 'no_pending_secret'
      })
      return null
    }

    // Align totp runtime with the parameters used during startEnrollment.
    totp.options = {
      step: pending.step ?? o.step,
      digits: (pending.digits as 6 | 7 | 8 | undefined) ?? o.digits
    }

    // Rate-limit confirmation attempts (prevents lucky guesses).
    const allowed = await this.checkRateLimit(userId, o)
    if (!allowed) return null

    // IMPORTANT: otplib typings might not include `window` on verify().
    // The runtime *does* support it, so we call via `any` to silence TS.
    const ok: boolean = (totp as any).verify({
      token: code,
      secret: pending.secret,
      window: o.window
    })

    if (!ok) {
      await audit(this.auditSvc, 'auth.mfa.totp.enroll_confirm_failed', {
        userId,
        reason: 'invalid_code'
      })
      return null
    }

    // Success: delete the pending secret; caller should store `secret` durably.
    if (this.cache) {
      await this.cache.del(kEnrollSecret(userId))
    }

    await audit(this.auditSvc, 'auth.mfa.totp.enroll_confirmed', { userId })
    return { secret: pending.secret }
  }

  // ───────────────────────────── Verification flow ───────────────────────────

  /**
   * Verify a TOTP code for sign-in using the *stored* user secret.
   * Returns true on success; false on failure or if rate-limited.
   */
  async verify(
    userId: string,
    secret: string,
    code: string,
    opts?: TotpOptions
  ): Promise<boolean> {
    const o = { ...this.defaults, ...(opts ?? {}) }

    // Rate-limit attempts before verification work.
    const allowed = await this.checkRateLimit(userId, o)
    if (!allowed) return false

    // Configure totp runtime.
    totp.options = { step: o.step, digits: o.digits }

    // Same typing nuance as above: call via `any` to pass `window`.
    const ok: boolean = (totp as any).verify({
      token: code,
      secret,
      window: o.window
    })

    if (!ok) {
      await audit(this.auditSvc, 'auth.mfa.totp.verification_failed', {
        userId,
        reason: 'invalid_code'
      })
      return false
    }

    await audit(this.auditSvc, 'auth.mfa.totp.verified', { userId })
    return true
  }

  // ───────────────────────────────── Utilities ───────────────────────────────

  /** Compose a default label for authenticator apps (e.g., "user@example.com"). */
  makeDefaultLabel(emailOrUsername: string): string {
    return emailOrUsername.trim()
  }

  /**
   * Apply a simple rate-limit: at most `rlMaxAttempts` attempts per `rlWindowSeconds`.
   * If no compatible repo is injected, allow the attempt but emit an audit event.
   */
  private async checkRateLimit(
    userId: string,
    o: Required<TotpOptions>
  ): Promise<boolean> {
    const key = kVerifyRatelimit(userId)
    const opts = { limit: o.rlMaxAttempts, ttlSeconds: o.rlWindowSeconds }

    if (!this.rateLimit) {
      await audit(this.auditSvc, 'auth.mfa.totp.ratelimit_missing', { userId })
      return true
    }

    try {
      // Preferred method
      if (typeof this.rateLimit.consume === 'function') {
        const res = await this.rateLimit.consume(key, opts)
        if (!res.allowed) {
          await audit(this.auditSvc, 'auth.mfa.totp.rate_limited', {
            userId,
            limit: o.rlMaxAttempts,
            window: o.rlWindowSeconds,
            resetIn: res.resetIn ?? null
          })
        }
        return res.allowed
      }

      // Fallback method #1
      if (typeof this.rateLimit.hit === 'function') {
        const allowed = await this.rateLimit.hit(key, opts)
        if (!allowed) {
          await audit(this.auditSvc, 'auth.mfa.totp.rate_limited', {
            userId,
            limit: o.rlMaxAttempts,
            window: o.rlWindowSeconds
          })
        }
        return allowed
      }

      // Fallback method #2: generic check()
      if (typeof this.rateLimit.check === 'function') {
        const res = await this.rateLimit.check(key, opts)
        const allowed = typeof res === 'boolean' ? res : !!res.allowed
        if (!allowed) {
          await audit(this.auditSvc, 'auth.mfa.totp.rate_limited', {
            userId,
            limit: o.rlMaxAttempts,
            window: o.rlWindowSeconds,
            resetIn: (res as any)?.resetIn ?? null
          })
        }
        return allowed
      }

      // No supported method exposed; allow but warn.
      await audit(this.auditSvc, 'auth.mfa.totp.ratelimit_unsupported_repo', {
        userId
      })
      return true
    } catch {
      // On repo failure, do NOT block MFA — allow and report.
      await audit(this.auditSvc, 'auth.mfa.totp.ratelimit_error', { userId })
      return true
    }
  }
}
