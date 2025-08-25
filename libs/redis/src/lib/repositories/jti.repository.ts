import { Inject, Injectable, Logger, Optional } from '@nestjs/common'
import { REDIS_CLIENT } from '../redis.constants'
import type { RedisClient, Seconds } from '../redis.types'

export interface JtiRecord {
  /** JWT ID (JTI) string */
  jti: string
  /** Optional subject (user id) for debugging/forensics */
  sub?: string | null
  /** Optional audience/client id */
  aud?: string | null
  /** Optional reason for revocation (e.g., "logout", "compromised", "rotated") */
  reason?: string | null
  /** Server timestamp when the block was recorded */
  createdAt: string // ISO string
  /** Additional metadata (IP, UA, requestId, etc.) */
  meta?: Record<string, unknown> | null
}

/**
 * Manages JTI (JWT ID) deny‑listing in Redis.
 * Pattern: jti:<jti> -> JSON(JtiRecord) with TTL matching token expiry.
 */
@Injectable()
export class JtiRepository {
  private readonly log = new Logger(JtiRepository.name)

  constructor(
    @Optional() @Inject(REDIS_CLIENT) private readonly redis?: RedisClient
  ) {}

  /** Whether Redis is wired up (useful for tests / fallback paths). */
  get isEnabled(): boolean {
    return !!this.redis
  }

  /** Compose the storage key for a JTI entry. */
  private key(jti: string): string {
    return `jti:${jti}`
  }

  /**
   * Block (deny‑list) a JTI for a certain duration.
   * @param jti JWT ID to block
   * @param ttlSeconds How long to keep the block (usually token's remaining lifetime)
   * @param record Optional metadata to store; minimal record is created if omitted
   * @returns true if successfully written
   */
  async block(
    jti: string,
    ttlSeconds: Seconds,
    record?: Partial<Omit<JtiRecord, 'jti' | 'createdAt'>>
  ): Promise<boolean> {
    if (!this.redis) return false
    const payload: JtiRecord = {
      jti,
      sub: record?.sub ?? null,
      aud: record?.aud ?? null,
      reason: record?.reason ?? null,
      createdAt: new Date().toISOString(),
      meta: record?.meta ?? null,
    }

    try {
      const ok = await this.redis.set(
        this.key(jti),
        JSON.stringify(payload),
        ttlSeconds
      )
      return ok === 'OK'
    } catch (err) {
      this.log.warn(`Failed to block JTI "${jti}": ${String(err)}`)
      return false
    }
  }

  /**
   * Check if a JTI is currently blocked (exists and not expired).
   */
  async isBlocked(jti: string): Promise<boolean> {
    if (!this.redis) return false
    try {
      const n = await this.redis.exists(this.key(jti))
      return n > 0
    } catch (err) {
      this.log.debug(`isBlocked("${jti}") error: ${String(err)}`)
      return false
    }
  }

  /**
   * Fetch full stored record for a JTI (if you need details for auditing).
   */
  async get(jti: string): Promise<JtiRecord | null> {
    if (!this.redis) return null
    const raw = await this.redis.get(this.key(jti))
    if (raw == null) return null
    try {
      return JSON.parse(raw) as JtiRecord
    } catch {
      // Corrupt/legacy value; clean up to avoid repeated parse errors
      try {
        await this.redis.del(this.key(jti))
      } catch {}
      return null
    }
  }

  /**
   * Remove a JTI from the deny‑list (rare; mainly for tests or admin tools).
   * Returns number of removed keys (0 or 1).
   */
  async unblock(jti: string): Promise<number> {
    if (!this.redis) return 0
    try {
      return await this.redis.del(this.key(jti))
    } catch (err) {
      this.log.debug(`unblock("${jti}") error: ${String(err)}`)
      return 0
    }
  }

  /**
   * Refresh TTL for an existing JTI entry.
   * Returns true if TTL was updated.
   */
  async touch(jti: string, ttlSeconds: Seconds): Promise<boolean> {
    if (!this.redis) return false
    try {
      const n = await this.redis.expire(this.key(jti), ttlSeconds)
      return n > 0
    } catch (err) {
      this.log.debug(`touch("${jti}") error: ${String(err)}`)
      return false
    }
  }

  /**
   * Remaining TTL in seconds, -1 if no expire, -2 if not found.
   * Best‑effort (depends on client support).
   */
  async ttl(jti: string): Promise<number> {
    if (!this.redis) return -2
    const anyClient = this.redis as unknown as {
      ttl?: (k: string) => Promise<number>
    }
    if (!anyClient.ttl) {
      const exists = await this.redis.exists(this.key(jti))
      return exists > 0 ? -1 : -2
    }
    return anyClient.ttl(this.key(jti))
  }
}
