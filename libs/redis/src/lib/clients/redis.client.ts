// libs/redis/src/lib/clients/redis.client.ts
import Redis from 'ioredis'
import type { RedisOptions } from 'ioredis'
import type { Seconds, RedisClient } from '../redis.types'

export class IoRedisClient implements RedisClient {
  private client: Redis

  constructor(opts: RedisOptions) {
    this.client = new Redis(opts)
    this.client.on('error', (err: unknown) => {
      // eslint-disable-next-line no-console
      console.error('[redis] error:', err)
    })
  }

  // ───────────────────────── Basic ops ─────────────────────────

  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async set(
    key: string,
    value: string,
    ttlSeconds?: Seconds
  ): Promise<'OK' | null> {
    if (ttlSeconds !== undefined) {
      const sec = ttlSeconds as unknown as number
      const r = await this.client.set(key, value, 'EX', sec)
      return r === 'OK' ? 'OK' : null
    }
    const r = await this.client.set(key, value)
    return r === 'OK' ? 'OK' : null
  }

  async del(key: string): Promise<number> {
    return this.client.del(key)
  }

  async expire(key: string, seconds: Seconds): Promise<number> {
    return this.client.expire(key, seconds as unknown as number)
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key)
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key)
  }

  async decr(key: string): Promise<number> {
    return this.client.decr(key)
  }

  async ping(): Promise<'PONG'> {
    const res = await this.client.ping()
    return res as 'PONG'
  }

  async publish(channel: string, message: string): Promise<number> {
    return this.client.publish(channel, message)
  }

  /** EXISTS command; accepts single key or array of keys. Returns count of existing keys. */
  async exists(keys: string | string[]): Promise<number> {
    const list = Array.isArray(keys) ? keys : [keys]
    return this.client.exists(...list)
  }

  /**
   * EVAL command wrapper matching RedisClient interface.
   * Accepts script, numKeys, and variadic args.
   */
  async eval<T = unknown>(
    script: string,
    numKeys: number,
    ...args: Array<string | number>
  ): Promise<T> {
    // ioredis typing allows eval(script, numKeys, ...args)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.client.eval(script, numKeys, ...(args as any)) as unknown as T
  }

  raw(): Redis {
    return this.client
  }

  async quit(): Promise<void> {
    await this.client.quit()
  }
}
