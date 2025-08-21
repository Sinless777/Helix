import { Inject, Injectable, Logger, Optional } from '@nestjs/common'
import { REDIS_CLIENT } from '../redis.constants'
import type { RedisClient, Seconds } from '../redis.types'

@Injectable()
export class CacheRepository {
  private readonly log = new Logger(CacheRepository.name)

  constructor(
    @Optional() @Inject(REDIS_CLIENT) private readonly redis?: RedisClient
  ) {}

  /** Whether a client is wired up (useful in unit tests). */
  get isEnabled(): boolean {
    return !!this.redis
  }

  // ────────────────────────────── String helpers ──────────────────────────────

  async get(key: string): Promise<string | null> {
    if (!this.redis) return null
    return this.redis.get(key)
  }

  /** Mirrors RedisClient signature: returns `"OK"` or `null`. */
  async set(
    key: string,
    value: string,
    ttlSeconds?: Seconds
  ): Promise<'OK' | null> {
    if (!this.redis) return null
    return this.redis.set(key, value, ttlSeconds)
  }

  async del(key: string): Promise<number> {
    if (!this.redis) return 0
    return this.redis.del(key)
  }

  /** Normalizes numeric EXISTS -> boolean. */
  async exists(key: string): Promise<boolean> {
    if (!this.redis) return false
    const n = await this.redis.exists(key)
    return n > 0
  }

  // ─────────────────────────────── JSON helpers ───────────────────────────────

  async getJSON<T = unknown>(key: string): Promise<T | null> {
    const raw = await this.get(key)
    if (raw == null) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      // Corrupt/legacy value; best effort delete to avoid repeated errors
      try {
        await this.del(key)
      } catch {}
      return null
    }
  }

  /**
   * Store JSON; returns `"OK"`/`null` like `set`.
   * Callers can coerce to boolean via `=== 'OK'` if desired.
   */
  async setJSON(
    key: string,
    value: unknown,
    ttlSeconds?: Seconds
  ): Promise<'OK' | null> {
    try {
      const payload = JSON.stringify(value)
      return this.set(key, payload, ttlSeconds)
    } catch (err) {
      this.log.warn(`Failed to stringify JSON for key "${key}": ${String(err)}`)
      return null
    }
  }

  // ─────────────────────────────── Convenience ────────────────────────────────

  /**
   * Read‑through cache helper.
   * If `key` is empty or client disabled, just returns the producer result.
   */
  async getOrSet<T>(
    key: string,
    producer: () => Promise<T>,
    ttlSeconds: Seconds,
    asJson = true
  ): Promise<T> {
    if (!this.redis || !key) {
      return producer()
    }

    if (asJson) {
      const hit = await this.getJSON<T>(key)
      if (hit != null) return hit
    } else {
      const hit = await this.get(key)
      if (hit != null) return hit as unknown as T
    }

    const fresh = await producer()

    try {
      if (asJson) {
        await this.setJSON(key, fresh, ttlSeconds)
      } else {
        await this.set(key, String(fresh), ttlSeconds)
      }
    } catch (err) {
      this.log.debug(
        `Cache write skipped for "${key}" due to error: ${String(err)}`
      )
    }

    return fresh
  }

  // ─────────────────────────────── Bulk helpers ───────────────────────────────

  /** Fallback multi-get using individual GET calls (no pipeline required). */
  async mget(keys: string[]): Promise<(string | null)[]> {
    if (!this.redis || keys.length === 0) return Array(keys.length).fill(null)
    const results = await Promise.all(keys.map((k) => this.redis!.get(k)))
    return results
  }

  /**
   * Best‑effort multi‑set with optional TTL for each pair (uniform TTL).
   * Loops to avoid assuming pipeline support on the client interface.
   */
  async mset(
    entries: Record<string, string>,
    ttlSeconds?: Seconds
  ): Promise<void> {
    if (!this.redis) return
    const tasks = Object.entries(entries).map(([k, v]) =>
      this.set(k, v, ttlSeconds)
    )
    await Promise.allSettled(tasks)
  }

  async msetJSON(
    entries: Record<string, unknown>,
    ttlSeconds?: Seconds
  ): Promise<void> {
    if (!this.redis) return
    const tasks = Object.entries(entries).map(([k, v]) =>
      this.setJSON(k, v, ttlSeconds)
    )
    await Promise.allSettled(tasks)
  }

  // ─────────────────────────────── TTL helpers ────────────────────────────────

  /** Normalizes numeric EXPIRE -> boolean. */
  async expire(key: string, ttlSeconds: Seconds): Promise<boolean> {
    if (!this.redis) return false
    const n = await this.redis.expire(key, ttlSeconds)
    return n > 0
  }

  /**
   * Return the remaining TTL in seconds, or:
   *  - -1 if the key exists but has no associated expire
   *  - -2 if the key does not exist
   *
   * Uses a best‑effort optional call since `ttl` isn’t in the RedisClient interface.
   */
  async ttl(key: string): Promise<number> {
    if (!this.redis) return -2
    const anyClient = this.redis as unknown as {
      ttl?: (k: string) => Promise<number>
    }
    if (!anyClient.ttl) {
      // Fallback: emulate as unknown if not supported.
      const exists = await this.redis.exists(key)
      return exists > 0 ? -1 : -2
    }
    return anyClient.ttl(key)
  }

  // ───────────────────────────── Namespacing misc ─────────────────────────────

  /**
   * Small helper if you want to create a namespaced key consistently.
   * Usage: repo.ns('userSession', userId, 'token') → "userSession:userId:token"
   */
  ns(...parts: Array<string | number | null | undefined>): string {
    return parts
      .filter((p): p is string | number => p !== null && p !== undefined)
      .map((p) => String(p).trim())
      .filter(Boolean)
      .join(':')
  }
}
