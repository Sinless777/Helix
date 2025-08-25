// libs/redis/src/lib/repositories/rate-limit.repository.ts

/**
 * Minimal Redis interface the repo needs. Adapt this to your client
 * (ioredis, node-redis, upstash via a thin wrapper, etc).
 */
export interface RedisLike {
  zadd(key: string, ...args: any[]): Promise<number>
  zremrangebyscore(
    key: string,
    min: number | string,
    max: number | string
  ): Promise<number>
  zcard(key: string): Promise<number>
  zrange(
    key: string,
    start: number,
    stop: number,
    withScores?: 'WITHSCORES'
  ): Promise<string[]>
  pexpire(key: string, ttlMs: number): Promise<number | boolean>
  pttl(key: string): Promise<number>
  del(key: string): Promise<number>
}

/** Options for the limiter */
export interface RateLimitOptions {
  /** size of the sliding window in milliseconds */
  windowMs: number
  /** max events allowed within window */
  limit: number
  /** key prefix to namespace limits (defaults to "rl") */
  prefix?: string
}

/** Result returned by check/take calls */
export interface RateLimitResult {
  key: string
  limit: number
  remaining: number
  allowed: boolean
  /** epoch ms when the request will fully reset under the limit */
  resetMs: number
  /** suggested retry delay in ms when not allowed */
  retryAfterMs?: number
}

/**
 * Sliding-window rate limiter using Redis ZSET.
 * Each event is added with score=timestamp(ms). Old entries are trimmed.
 */
export class RateLimitRepository {
  private readonly windowMs: number
  private readonly limit: number
  private readonly prefix: string

  constructor(
    private readonly redis: RedisLike,
    opts: RateLimitOptions
  ) {
    this.windowMs = opts.windowMs
    this.limit = opts.limit
    this.prefix = opts.prefix ?? 'rl'
  }

  private keyFor(id: string): string {
    return `${this.prefix}:${id}`
  }

  /**
   * Check the current state without consuming a token.
   */
  async check(id: string): Promise<RateLimitResult> {
    const key = this.keyFor(id)
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Trim old entries
    await this.redis.zremrangebyscore(key, 0, windowStart)

    // Count current tokens
    const count = await this.redis.zcard(key)

    // Ensure TTL so idle keys expire
    await this.ensureTtl(key)

    // Determine oldest entry to compute an accurate reset
    const oldest = await this.getOldestMs(key)
    const resetMs =
      oldest != null ? oldest + this.windowMs : now + this.windowMs

    const allowed = count < this.limit
    const remaining = Math.max(this.limit - count, 0)
    const retryAfterMs = allowed ? undefined : Math.max(resetMs - now, 0)

    return { key, limit: this.limit, remaining, allowed, resetMs, retryAfterMs }
  }

  /**
   * Consume 1 token and return the new state. If not allowed, the token is still
   * recorded (use `check` first if you only want a dry-run).
   */
  async take(id: string): Promise<RateLimitResult> {
    const key = this.keyFor(id)
    const now = Date.now()
    const windowStart = now - this.windowMs

    // 1) Trim old entries
    await this.redis.zremrangebyscore(key, 0, windowStart)

    // 2) Add this event (use a unique member to avoid collisions)
    const member = `${now}-${Math.random().toString(36).slice(2)}`
    // ioredis style: ZADD key NX score member
    await this.redis.zadd(key, 'NX', now, member)

    // 3) Count and TTL
    const count = await this.redis.zcard(key)
    await this.ensureTtl(key)

    const oldest = await this.getOldestMs(key)
    const resetMs =
      oldest != null ? oldest + this.windowMs : now + this.windowMs

    const allowed = count <= this.limit
    const remaining = Math.max(this.limit - count, 0)
    const retryAfterMs = allowed ? undefined : Math.max(resetMs - now, 0)

    return { key, limit: this.limit, remaining, allowed, resetMs, retryAfterMs }
  }

  /**
   * Clear all tokens for a subject.
   */
  async reset(id: string): Promise<void> {
    await this.redis.del(this.keyFor(id))
  }

  private async ensureTtl(key: string): Promise<void> {
    const ttl = await this.redis.pttl(key)
    // -2 = key does not exist, -1 = no expiry. Refresh to the window size.
    if (ttl < 0 || ttl > this.windowMs) {
      await this.redis.pexpire(key, this.windowMs)
    }
  }

  private async getOldestMs(key: string): Promise<number | null> {
    // ZRANGE key 0 0 WITHSCORES => [member, "score"]
    const res = await this.redis.zrange(key, 0, 0, 'WITHSCORES')
    if (!res || res.length < 2) return null
    const score = Number(res[1])
    return Number.isFinite(score) ? score : null
  }
}

/**
 * Convenience factory that pulls defaults from env (uses bracket access to
 * satisfy TS "noPropertyAccessFromIndexSignature").
 */
export function makeRateLimiter(
  redis: RedisLike,
  opts?: Partial<RateLimitOptions>
) {
  const windowMs = Number(
    opts?.windowMs ?? process.env['RATE_LIMIT_WINDOW_MS'] ?? 60_000
  )
  const limit = Number(opts?.limit ?? process.env['RATE_LIMIT_LIMIT'] ?? 60)
  const prefix = opts?.prefix ?? process.env['RATE_LIMIT_PREFIX'] ?? 'rl'

  return new RateLimitRepository(redis, { windowMs, limit, prefix })
}
