// libs/redis/src/index.ts
// -----------------------------------------------------------------------------
// Barrel exports for the Redis library
// - Core pieces are exported directly
// - Collision-prone modules are exported under namespaces (avoids TS2308)
// -----------------------------------------------------------------------------

// Types / core first (canonical home for shared types like RedisLike, Seconds)
export * from './lib/redis.types'
export * from './lib/redis.constants'
export * from './lib/redis.tokens'
export * from './lib/redis.module'

// Clients
export * from './lib/clients/redis.client'
export * from './lib/clients/redis.factory'
// Expose the class directly for convenience, and a namespace for full surface
export { RedisSubscriber } from './lib/clients/redis.subscriber'
export * as RedisSubscriberNS from './lib/clients/redis.subscriber'

// Config
export * from './lib/config/redis.config'

// Decorators / Interceptors / Health
export * from './lib/decorators/cache-ttl.decorator'
export * from './lib/interceptors/cache.interceptor'
export * from './lib/health/redis.health'

// Repositories
// Export the main classes directly…
export { CacheRepository } from './lib/repositories/cache.repository'
export { JtiRepository } from './lib/repositories/jti.repository'
export { OtpRepository } from './lib/repositories/otp.repository'
export { RateLimitRepository } from './lib/repositories/rate-limit.repository'
export { RefreshTokenRepository } from './lib/repositories/refresh-token.repository'
export { SessionRepository } from './lib/repositories/session.repository'
// …and also provide namespaces so all their helper types are accessible
// without colliding with top-level names (e.g., RedisLike, RateLimitResult).
export * as CacheRepo from './lib/repositories/cache.repository'
export * as JtiRepo from './lib/repositories/jti.repository'
export * as OtpRepo from './lib/repositories/otp.repository'
export * as RateLimitRepo from './lib/repositories/rate-limit.repository'
export * as RefreshTokenRepo from './lib/repositories/refresh-token.repository'
export * as SessionRepo from './lib/repositories/session.repository'

// Utils
// Namespace exports prevent name collisions like `stableStringify`, `ParseOptions`, etc.
export * as HashUtil from './lib/utils/hash.util'
export * as JsonUtil from './lib/utils/json.util'
export * as KeyUtil from './lib/utils/key.util'
export * as RateLimitUtil from './lib/utils/rate-limit.util'
export * as TtlUtil from './lib/utils/ttl.util'
