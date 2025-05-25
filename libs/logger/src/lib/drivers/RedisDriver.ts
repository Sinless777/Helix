// libs/logger/src/lib/drivers/RedisDriver.ts

import Redis, { RedisOptions } from 'ioredis'
import { DriverBase } from '../DriverBase'
import { JSONFormatter } from '../formatters/JSONFormatter'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Configuration options for RedisDriver.
 *
 * streamKeyPrefix: Prefix for Redis stream keys; actual key is `${streamKeyPrefix}${category}`.
 * ttlSeconds: Time-to-live for each stream key, in seconds.
 */
export interface RedisDriverOptions extends RedisOptions {
  streamKeyPrefix?: string
  ttlSeconds?: number
}

/**
 * Writes log records into per-category Redis streams.
 * Uses JSONFormatter to serialize each record, sets TTL on stream keys.
 */
export class RedisDriver extends DriverBase {
  private client: Redis | null = null
  private readonly formatter = new JSONFormatter()
  private readonly options: Required<
    Pick<RedisDriverOptions, 'streamKeyPrefix' | 'ttlSeconds'>
  >

  /**
   * @param redisOptions - Connection and behavior settings for Redis driver.
   */
  constructor(private readonly redisOptions: RedisDriverOptions) {
    super()
    this.options = {
      streamKeyPrefix: redisOptions.streamKeyPrefix ?? 'logs:',
      ttlSeconds: redisOptions.ttlSeconds ?? 86400,
    }
  }

  /**
   * Establish the Redis connection and mark the driver as running.
   */
  public async initialize(): Promise<void> {
    this.enable()
    this.client = new Redis(this.redisOptions)
    await this.start()
  }

  /**
   * Mark the driver as ready to process log records.
   */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /**
   * Add a log record to the Redis stream.
   *
   * If metadata.category is provided, it is appended to the streamKeyPrefix.
   * Otherwise the 'default' category is used.
   *
   * @param record - The structured log record to enqueue.
   * @throws Error if Redis operations fail.
   */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isEnabled() || !this.isRunning() || !this.client) {
      return
    }

    const category = record.metadata?.['category'] ?? 'default'
    const key = `${this.options.streamKeyPrefix}${category}`
    const data = this.formatter.format(record)

    // Append JSON payload under "data" field
    await this.client.xadd(key, '*', 'data', data)
    // Reset TTL to ensure eviction after ttlSeconds
    await this.client.expire(key, this.options.ttlSeconds)
  }

  /**
   * Stop processing new log records.
   */
  public async stop(): Promise<void> {
    this.setRunning(false)
  }

  /**
   * Gracefully shut down the driver and close the Redis connection.
   */
  public async shutdown(): Promise<void> {
    await this.stop()
    if (this.client) {
      await this.client.quit()
      this.client = null
    }
  }
}
