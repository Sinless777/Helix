import type {
  Milliseconds,
  Seconds,
  RedisClient,
  RateLimitResult,
  TokenBucketResult,
} from '../redis.types'
import { randomId } from './hash.util'
import { milliseconds as ms } from '../redis.constants'

/* ───────────────────────── Fixed Window (INCR + PEXPIRE) ─────────────────────
   Pattern: increment a counter per window, set TTL on first hit.
   Atomicity via Lua; we avoid TIME inside scripts that mutate data.
   Result derives resetAt from client clock + PTTL returned by script.
-------------------------------------------------------------------------------*/

const LUA_FIXED_WINDOW = `
-- KEYS[1] = counter key
-- ARGV[1] = windowMs
local c = redis.call('INCR', KEYS[1])
if c == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
return {c, ttl}
`

/**
 * Fixed-window rate limit.
 * @param client Redis client
 * @param key Redis key for the window bucket
 * @param limit Max hits per window
 * @param windowSeconds Window size (seconds)
 */
export async function fixedWindowRateLimit(
  client: RedisClient,
  key: string,
  limit: number,
  windowSeconds: Seconds | number,
  nowMs: Milliseconds | number = Date.now()
): Promise<RateLimitResult> {
  const windowMs = Math.max(0, Math.floor(Number(windowSeconds) * 1000))
  const [countRaw, ttlRaw] = (await client.eval(
    LUA_FIXED_WINDOW,
    1,
    key,
    windowMs
  )) as [number, number]

  const count = Number(countRaw) || 0
  const ttl = Math.max(0, Number(ttlRaw) || 0) // ms until window reset
  const allowed = count <= limit
  const remaining = Math.max(0, limit - count)
  const retryIn = allowed ? 0 : ttl
  const resetAt = new Date(Number(nowMs) + ttl)

  return {
    allowed,
    remaining,
    limit,
    resetAt,
    retryInMs: ms(retryIn),
    totalHits: count,
  }
}

/* ───────────────────────── Sliding Window (ZSET) ─────────────────────────────
   Pattern: sorted set of hit timestamps; drop old, count current, allow if < limit.
   We pass 'now' from the app for determinism; set PEXPIRE to window to GC idle keys.
-------------------------------------------------------------------------------*/

const LUA_SLIDING_WINDOW = `
-- KEYS[1] = zset key
-- ARGV[1] = nowMs
-- ARGV[2] = windowMs
-- ARGV[3] = limit
-- ARGV[4] = member (unique id for this hit)
local now   = tonumber(ARGV[1])
local w     = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member= ARGV[4]

-- purge old
redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, now - w)

-- count active
local count = redis.call('ZCARD', KEYS[1])
local allowed = 0
if count < limit then
  redis.call('ZADD', KEYS[1], now, member)
  allowed = 1
  count = count + 1
end

-- keep key around for at most window
redis.call('PEXPIRE', KEYS[1], w)

-- compute time until the earliest entry leaves the window
local resetIn = 0
if count > 0 then
  local res = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
  if res and #res >= 2 then
    local oldest = tonumber(res[2])
    resetIn = w - (now - oldest)
    if resetIn < 0 then resetIn = 0 end
  end
end

local ttl = redis.call('PTTL', KEYS[1]) -- GC TTL, may be >= resetIn
return {allowed, count, resetIn, ttl}
`

/**
 * Sliding-window rate limit (ZSET-based).
 * @param client Redis client
 * @param key Redis key for the sliding window set
 * @param limit Max hits within the window
 * @param windowSeconds Window size (seconds)
 */
export async function slidingWindowRateLimit(
  client: RedisClient,
  key: string,
  limit: number,
  windowSeconds: Seconds | number,
  nowMs: Milliseconds | number = Date.now()
): Promise<RateLimitResult> {
  const windowMs = Math.max(0, Math.floor(Number(windowSeconds) * 1000))
  const member = `${nowMs}-${randomId(8)}` // unique entry

  const [allowedRaw, countRaw, resetInRaw] = (await client.eval(
    LUA_SLIDING_WINDOW,
    1,
    key,
    Number(nowMs),
    windowMs,
    limit,
    member
  )) as [number, number, number, number]

  const allowed = Number(allowedRaw) === 1
  const count = Number(countRaw) || 0
  const remaining = Math.max(0, limit - count)

  const resetInMs = Math.max(0, Number(resetInRaw) || 0)
  const retryIn = allowed ? 0 : resetInMs
  const resetAt = new Date(Number(nowMs) + resetInMs)

  return {
    allowed,
    remaining,
    limit,
    resetAt,
    retryInMs: ms(retryIn),
    totalHits: count,
  }
}

/* ───────────────────────── Token Bucket (HMSET) ──────────────────────────────
   Pattern: maintain { tokens, ts } in a hash.
   - Refill = elapsedMs * (refillPerSec/1000)
   - Allow if tokens >= requested; else compute wait time.
   - PEXPIRE the key to auto-clean when idle.
-------------------------------------------------------------------------------*/

const LUA_TOKEN_BUCKET = `
-- KEYS[1] = bucket key (hash)
-- ARGV[1] = nowMs
-- ARGV[2] = capacity (max tokens)
-- ARGV[3] = refillPerSec (tokens per second, float)
-- ARGV[4] = requested (tokens to consume)
-- ARGV[5] = ttlMs (for GC)

local now      = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local rateSec  = tonumber(ARGV[3])
local req      = tonumber(ARGV[4])
local ttlMs    = tonumber(ARGV[5])

local vals = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local tokens = tonumber(vals[1])
local ts     = tonumber(vals[2])

if not tokens then tokens = capacity end
if not ts then ts = now end

local elapsed = now - ts
if elapsed < 0 then elapsed = 0 end
local refill = elapsed * (rateSec / 1000.0) -- tokens per ms
tokens = math.min(capacity, tokens + refill)

local allowed = 0
local nextInMs = 0

if tokens >= req then
  tokens = tokens - req
  allowed = 1
else
  local deficit = req - tokens
  local perMs = (rateSec / 1000.0)
  if perMs > 0 then
    nextInMs = math.ceil(deficit / perMs)
  else
    nextInMs = -1
  end
end

redis.call('HMSET', KEYS[1], 'tokens', tokens, 'ts', now)
if ttlMs and ttlMs > 0 then
  redis.call('PEXPIRE', KEYS[1], ttlMs)
end

return {allowed, tokens, nextInMs}
`

/**
 * Token bucket (leaky bucket-like) rate limit.
 * @param client Redis client
 * @param key Bucket key (hash)
 * @param capacity Max tokens in the bucket
 * @param refillPerSecond Refill rate (tokens/sec, float OK)
 * @param tokensRequested Tokens to consume (default 1)
 */
export async function tokenBucketConsume(
  client: RedisClient,
  key: string,
  capacity: number,
  refillPerSecond: number,
  tokensRequested = 1,
  nowMs: Milliseconds | number = Date.now()
): Promise<TokenBucketResult> {
  // Auto-GC TTL: ~2x time-to-full (so idle buckets disappear)
  const timeToFullSec = capacity / Math.max(0.000001, refillPerSecond)
  const ttlMs = Math.max(0, Math.ceil(timeToFullSec * 2000))

  const [allowedRaw, tokensRaw, nextInRaw] = (await client.eval(
    LUA_TOKEN_BUCKET,
    1,
    key,
    Number(nowMs),
    capacity,
    refillPerSecond,
    tokensRequested,
    ttlMs
  )) as [number, number, number]

  const allowed = Number(allowedRaw) === 1
  const tokens = Math.max(0, Number(tokensRaw) || 0)
  const nextInMs = Math.max(0, Number(nextInRaw) || 0)

  return {
    allowed,
    tokens,
    capacity,
    fullRefillAt: allowed
      ? undefined
      : new Date(
          Number(nowMs) +
            nextInMs +
            Math.ceil(
              (capacity - tokens) / Math.max(0.000001, refillPerSecond)
            ) *
              1000
        ),
    nextInMs: allowed ? ms(0) : ms(nextInMs),
  }
}

/* ───────────────────────── Convenience helpers ────────────────────────────── */

/** Human helper: compute the start-of-window key material (e.g., for fixed window sharding) */
export function windowKeySuffix(
  nowMs: number,
  windowSeconds: Seconds | number
): string {
  const size = Math.max(1, Math.floor(Number(windowSeconds)))
  const bucket = Math.floor(Math.floor(nowMs / 1000) / size)
  return String(bucket)
}
