// libs/redis/src/lib/clients/redis.factory.ts
import type { RedisOptions } from 'ioredis'
import { IoRedisClient } from './redis.client'
import {
  loadRedisConfig,
  toIoRedisOptions,
  type RedisConfig,
} from '../config/redis.config'
import { REDIS_CLIENT, REDIS_CONFIG } from '../redis.constants'

/**
 * Create an IoRedisClient from a (possibly partial) config.
 * Missing values are filled from environment defaults via `loadRedisConfig()`.
 */
export function createRedisClient(
  partial?: Partial<RedisConfig>
): IoRedisClient {
  const base = loadRedisConfig()
  const finalCfg: RedisConfig = { ...base, ...(partial ?? {}) }
  const opts: RedisOptions = toIoRedisOptions(finalCfg)
  return new IoRedisClient(opts)
}

/**
 * Small OO wrapper if you prefer a class-based factory.
 */
export class RedisFactory {
  /** Create using environment (and optional overrides). */
  static fromEnv(overrides?: Partial<RedisConfig>): IoRedisClient {
    return createRedisClient(overrides)
  }

  /** Create directly from a full config object. */
  static fromConfig(config: RedisConfig): IoRedisClient {
    const opts: RedisOptions = toIoRedisOptions(config)
    return new IoRedisClient(opts)
  }

  /** Produce just the ioredis options (useful for tests). */
  static toOptions(config?: Partial<RedisConfig>): RedisOptions {
    const base = loadRedisConfig()
    return toIoRedisOptions({ ...base, ...(config ?? {}) })
  }
}

/**
 * NestJS provider helpers
 * Usage in a module:
 *
 * @Module({
 *   providers: [
 *     createRedisConfigProvider(),
 *     createRedisProvider(),
 *   ],
 *   exports: [REDIS_CLIENT, REDIS_CONFIG],
 * })
 */
export function createRedisConfigProvider(partial?: Partial<RedisConfig>) {
  const value: RedisConfig = { ...loadRedisConfig(), ...(partial ?? {}) }
  return {
    provide: REDIS_CONFIG,
    useValue: value,
  } as const
}

export function createRedisProvider(partial?: Partial<RedisConfig>) {
  return {
    provide: REDIS_CLIENT,
    useFactory: () => createRedisClient(partial),
  } as const
}
