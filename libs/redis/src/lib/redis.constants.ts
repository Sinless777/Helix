import type { Milliseconds, Seconds, RedisTtls } from './redis.types'
import type { RedisConfig } from './config/redis.config'

/**
 * Nest DI tokens — keep them as strings so they’re easy to reference across packages.
 */
export const REDIS_MODULE_OPTIONS = 'REDIS_MODULE_OPTIONS'
export const REDIS_CLIENT = 'REDIS_CLIENT'
export const REDIS_SUBSCRIBER = 'REDIS_SUBSCRIBER'

/**
 * Default connection values (used by config parsing/fallbacks).
 */
export const DEFAULT_REDIS_HOST = 'redis'
export const DEFAULT_REDIS_PORT = 6379
export const DEFAULT_REDIS_DB = 0

/**
 * Global key prefix for this project. All Redis keys should live under this.
 * (Key builders in utils should honor/compose this prefix.)
 */
export const KEY_PREFIX = 'helix' as const

/**
 * Common key namespaces used across the codebase.
 * Combine these with specific identifiers in your key utilities.
 */
export const KEY_NS = {
  cache: 'cache',
  rate: 'rate',
  otp: 'otp',
  session: 'session',
  refresh: 'refresh',
  jti: 'jti',
  device: 'device',
  apiKey: 'apiKey',
  feature: 'feature',
  custom: 'custom',
} as const

/**
 * Frequently used fixed keys / channels.
 */
export const HEALTH_KEY = `${KEY_PREFIX}:health`
export const EVENTS_CHANNEL = `${KEY_PREFIX}:events` // general pub/sub channel (optional baseline)

/**
 * Time helpers to strongly type durations where useful.
 */
export const seconds = (n: number) => n as Seconds
export const milliseconds = (n: number) => n as Milliseconds

/**
 * Opinionated default TTLs across features.
 * Override per feature/repository call as needed.
 */
export const DEFAULT_TTLS: Required<RedisTtls> = {
  cacheTtl: seconds(60 * 5), // 5 minutes
  otpTtl: seconds(60 * 5), // 5 minutes (email/SMS codes)
  sessionTtl: seconds(60 * 60 * 24 * 7), // 7 days
  refreshTtl: seconds(60 * 60 * 24 * 30), // 30 days
  jtiTtl: seconds(60 * 60 * 24 * 30), // align with refresh TTL
  rateWindowTtl: seconds(60), // 1 minute sliding window
  deviceTrustTtl: seconds(60 * 60 * 24 * 30), // 30 days for “remember device”
}

/**
 * Client behavior defaults.
 */
export const DEFAULT_COMMAND_TIMEOUT = milliseconds(5_000) // 5s
export const DEFAULT_MAX_RETRIES_PER_REQUEST = 3

/**
 * Default rate-limit policies (optional baseline; tweak per route).
 * These are not enforced automatically—repositories/utilities should
 * read these values as sensible defaults.
 */
export const DEFAULT_RATE_LIMITS = {
  login: { limit: 5, window: seconds(60) }, // 5/min
  signup: { limit: 3, window: seconds(60 * 5) }, // 3/5min
  magicLink: { limit: 5, window: seconds(60) }, // 5/min
  passwordReset: { limit: 5, window: seconds(60 * 10) }, // 5/10min
} as const

export const REDIS_CONFIG: RedisConfig = {
  host: DEFAULT_REDIS_HOST,
  port: DEFAULT_REDIS_PORT,
  db: DEFAULT_REDIS_DB,
  password: process.env.REDIS_PASSWORD,
  keyPrefix: '',
  maxRetriesPerRequest: 0,
  commandTimeoutMs: 0,
}
