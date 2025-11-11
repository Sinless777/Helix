import type { RedisConfig } from '../types/redis';

export const redisConfig: RedisConfig = {
    url: process.env.REDIS_URL || '',
    host: process.env.REDIS_HOST || '',
    username: process.env.REDIS_USERNAME || '',
    password: process.env.REDIS_PASSWORD || '',
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
    cachePrefix: process.env.REDIS_CACHE_PREFIX || 'helix',
    cacheExpirationMs: process.env.REDIS_CACHE_EXPIRATION_MS ? Number(process.env.REDIS_CACHE_EXPIRATION_MS) : 60_000,
}