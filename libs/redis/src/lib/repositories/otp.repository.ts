// libs/redis/src/lib/repositories/otp.repository.ts
// -----------------------------------------------------------------------------
// OTP Repository (Redis-backed)
// -----------------------------------------------------------------------------
// Responsibilities
//   • Store short-lived one-time codes (OTP) under namespaced keys
//   • Verify codes using a constant-time hash comparison
//   • Optional “consume on success” semantics (delete after verify)
//   • Simple helpers for TTL checks and invalidation
//
// Design notes
//   • We store only a SHA-256 hash of the code (never plaintext) + minimal metadata.
//   • Keys are namespaced as: "otp:{subject}" or "otp:{subject}:{kind}"
//     - subject: who/what the OTP is for (user id, email, phone, etc.)
//     - kind: optional discriminator (e.g., "login", "reset", "mfa")
//   • We use CacheRepository from this library for JSON + TTL utilities.
//   • All methods are safe if Redis is not wired (they no-op / return null/false).
//
// Example usage
//   await repo.issue('user-123', '123456', 300 as Seconds, { kind: 'login' })
//   const ok = await repo.verify('user-123', '123456', { kind: 'login' })
//   if (ok) { /* success */ }

import { Injectable, Logger, Optional } from '@nestjs/common'
import { createHash, timingSafeEqual } from 'node:crypto'
import { CacheRepository } from './cache.repository'
import type { Seconds } from '../redis.types'

/* -----------------------------------------------------------------------------
 * Record shape stored in Redis
 * -------------------------------------------------------------------------- */

export interface OtpRecord {
  /** sha256(base64url) of the OTP code */
  hash: string
  /** ISO timestamp (created) — informational only */
  createdAt: string
  /** Arbitrary metadata you might want to keep (audit, channel, etc.) */
  meta?: Record<string, unknown>
  /** Optional attempt counter (incremented by verify when comparison fails) */
  attempts?: number
  /** Optional attempt ceiling for clients that want rate-limiting by attempts */
  maxAttempts?: number
}

/* -----------------------------------------------------------------------------
 * Options
 * -------------------------------------------------------------------------- */

export interface OtpIssueOptions {
  /** Optional discriminator, e.g., 'login' | 'reset' | 'mfa' */
  kind?: string
  /** Attach arbitrary metadata (channel, ip, user agent, etc.) */
  meta?: Record<string, unknown>
  /** Start attempts at zero with an allowed ceiling (purely advisory) */
  maxAttempts?: number
}

export interface OtpVerifyOptions {
  /** Same discriminator used when issuing; helps keep OTPs separate by flow */
  kind?: string
  /**
   * Consume (delete) the OTP once it verifies successfully.
   * Default: true (most OTPs are single-use).
   */
  consumeOnSuccess?: boolean
  /**
   * When present, verification will fail once attempts >= maxAttempts.
   * If not set, attempts are tracked but not enforced here.
   */
  maxAttempts?: number
}

/* -----------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */

/** Compute a base64url sha256 hash of the OTP code (no plaintext at rest). */
function hashCode(code: string): string {
  return createHash('sha256').update(code, 'utf8').digest('base64url')
}

/** Constant-time equality for two base64url strings. */
function safeEqualBase64url(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8')
  const bb = Buffer.from(b, 'utf8')
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

/** Fallback namespacer if CacheRepository.ns is unavailable. */
function joinNs(...parts: Array<string | number | null | undefined>): string {
  return parts
    .filter((p): p is string | number => p !== null && p !== undefined)
    .map((p) => String(p).trim())
    .filter(Boolean)
    .join(':')
}

/* -----------------------------------------------------------------------------
 * Repository
 * -------------------------------------------------------------------------- */

@Injectable()
export class OtpRepository {
  private readonly log = new Logger(OtpRepository.name)

  constructor(@Optional() private readonly cache?: CacheRepository) {}

  /** Whether Redis is wired (handy for conditional behavior in services). */
  get isEnabled(): boolean {
    return !!this.cache
  }

  /** Compute the Redis key for a subject/kind pair. */
  private key(subject: string, kind?: string): string {
    // Prefer the repository’s own namespacer for consistency
    if (this.cache?.ns) return this.cache.ns('otp', subject, kind)
    // Fallback if needed
    return joinNs('otp', subject, kind)
  }

  /**
   * Issue/store an OTP. Only the hash is persisted.
   * Returns 'OK' when stored, or null if no Redis/failed.
   */
  async issue(
    subject: string,
    code: string,
    ttlSeconds: Seconds,
    opts?: OtpIssueOptions
  ): Promise<'OK' | null> {
    if (!this.cache) return null
    const key = this.key(subject, opts?.kind)
    const record: OtpRecord = {
      hash: hashCode(code),
      createdAt: new Date().toISOString(),
      meta: opts?.meta,
      attempts: 0,
      maxAttempts: opts?.maxAttempts
    }
    return this.cache.setJSON(key, record, ttlSeconds)
  }

  /**
   * Verify an OTP code for a subject (and optional kind).
   * On success (and when consumeOnSuccess=true), deletes the record.
   * Returns true when verified; false otherwise.
   */
  async verify(
    subject: string,
    code: string,
    opts?: OtpVerifyOptions
  ): Promise<boolean> {
    if (!this.cache) return false
    const key = this.key(subject, opts?.kind)

    const stored = await this.cache.getJSON<OtpRecord>(key)
    if (!stored) return false

    // Enforce attempt ceiling if requested (either stored or passed in)
    const ceiling = opts?.maxAttempts ?? stored.maxAttempts
    if (typeof ceiling === 'number' && ceiling >= 0) {
      const attempts = stored.attempts ?? 0
      if (attempts >= ceiling) {
        // Out of attempts — keep the record (so TTL still applies) and fail
        return false
      }
    }

    const candidateHash = hashCode(code)
    const match = safeEqualBase64url(candidateHash, stored.hash)

    if (match) {
      // Single-use by default: delete the OTP to prevent replay
      const consume =
        opts?.consumeOnSuccess === undefined ? true : !!opts.consumeOnSuccess
      if (consume) {
        try {
          await this.cache.del(key)
        } catch {
          // Never block success on a deletion error
          this.log.debug(`OTP consume (del) failed for ${key}`)
        }
      }
      return true
    }

    // Mismatch: bump attempts best-effort (read-modify-write with same TTL)
    try {
      // Preserve the remaining TTL so we don’t extend the validity window.
      const ttl = await this.cache.ttl(key)
      const attempts = (stored.attempts ?? 0) + 1
      await this.cache.setJSON(
        key,
        { ...stored, attempts },
        // `ttl` can be -2 (missing) or -1 (no expire). Only apply when positive.
        ttl > 0 ? (ttl as Seconds) : undefined
      )
    } catch {
      // Non-critical — verification result is still false
    }

    return false
  }

  /** Invalidate any outstanding OTP for a subject/kind pair (best effort). */
  async invalidate(subject: string, kind?: string): Promise<void> {
    if (!this.cache) return
    try {
      await this.cache.del(this.key(subject, kind))
    } catch {
      /* ignore */
    }
  }

  /** Does an OTP currently exist for this subject/kind? */
  async exists(subject: string, kind?: string): Promise<boolean> {
    if (!this.cache) return false
    return this.cache.exists(this.key(subject, kind))
  }

  /**
   * Remaining TTL for this OTP in seconds:
   *   >0  = seconds remaining
   *   -1  = key exists but no expire set
   *   -2  = key does not exist
   */
  async ttl(subject: string, kind?: string): Promise<number> {
    if (!this.cache) return -2
    return this.cache.ttl(this.key(subject, kind))
  }

  /** Peek at the stored record (hash + metadata) — useful for audits/tests. */
  async peek(subject: string, kind?: string): Promise<OtpRecord | null> {
    if (!this.cache) return null
    return this.cache.getJSON<OtpRecord>(this.key(subject, kind))
  }
}
