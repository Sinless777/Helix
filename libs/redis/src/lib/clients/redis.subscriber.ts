// libs/redis/src/lib/clients/redis.subscriber.ts
import Redis, { type Redis as IoRedis } from 'ioredis'
import { loadRedisConfig, toIoRedisOptions } from '../config/redis.config'

/**
 * Dedicated Redis Pub/Sub connection.
 * We intentionally do NOT reuse the main Redis client to avoid interference
 * between Pub/Sub mode and normal command pipelines.
 */
export class RedisSubscriber {
  private readonly subscriber: IoRedis

  constructor() {
    const cfg = loadRedisConfig()
    this.subscriber = new Redis(toIoRedisOptions(cfg))
  }

  /**
   * Subscribe to one or more channels.
   * @param channels Channel(s) to subscribe to
   * @param listener Callback invoked with (channel, message)
   */
  async subscribe(
    channels: string | string[],
    listener: (channel: string, message: string) => void
  ): Promise<void> {
    const arr = Array.isArray(channels) ? channels : [channels]

    this.subscriber.on('message', (ch: string, msg: string) => {
      listener(ch, msg)
    })

    await this.subscriber.subscribe(...arr)
  }

  /**
   * Pattern subscribe (psubscribe).
   * Useful for wildcard subscriptions.
   */
  async psubscribe(
    patterns: string | string[],
    listener: (pattern: string, channel: string, message: string) => void
  ): Promise<void> {
    const arr = Array.isArray(patterns) ? patterns : [patterns]

    this.subscriber.on('pmessage', (pat: string, ch: string, msg: string) => {
      listener(pat, ch, msg)
    })

    await this.subscriber.psubscribe(...arr)
  }

  /** Unsubscribe from one or more channels. */
  async unsubscribe(channels?: string | string[]): Promise<void> {
    if (!channels) {
      await this.subscriber.unsubscribe()
      return
    }
    const arr = Array.isArray(channels) ? channels : [channels]
    await this.subscriber.unsubscribe(...arr)
  }

  /** Unsubscribe from one or more patterns. */
  async punsubscribe(patterns?: string | string[]): Promise<void> {
    if (!patterns) {
      await this.subscriber.punsubscribe()
      return
    }
    const arr = Array.isArray(patterns) ? patterns : [patterns]
    await this.subscriber.punsubscribe(...arr)
  }

  /** Close the subscriber connection. */
  async quit(): Promise<void> {
    await this.subscriber.quit()
  }
}
