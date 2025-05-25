// libs/logger/src/lib/drivers/RedisDriver.ts

import Redis, { RedisOptions } from 'ioredis'
import { DriverBase } from '../DriverBase'
import { JSONFormatter } from '../formatters/JSONFormatter'
import type { LogRecord } from '../../types/LogRecord'

/**
 * @interface RedisDriverOptions
 * @extends RedisOptions
 * @description
 * Configuration options for {@link RedisDriver}.
 *
 * @property {string} [streamKeyPrefix='logs:']
 *   Prefix for Redis stream keys. The full key used is `${streamKeyPrefix}${category}`.
 * @property {number} [ttlSeconds=86400]
 *   Time-to-live for each stream key in seconds (default is 24 hours).
 */
export interface RedisDriverOptions extends RedisOptions {
  streamKeyPrefix?: string
  ttlSeconds?: number
}

/**
 * @class RedisDriver
 * @extends DriverBase
 * @description
 * Writes log records into Redis streams, one per category, with optional TTL eviction.
 * Utilizes `ioredis` for Redis interaction and {@link JSONFormatter} to serialize log records.
 */
export class RedisDriver extends DriverBase {
  /** @private Redis client instance */
  private client: Redis | null = null

  /** @private Formatter used to serialize records to JSON */
  private readonly formatter = new JSONFormatter()

  /** @private Resolved configuration */
  private readonly options: Required<
    Pick<RedisDriverOptions, 'streamKeyPrefix' | 'ttlSeconds'>
  >

  /**
   * @constructor
   * @param {RedisDriverOptions} redisOptions - Connection and behavior settings for Redis
   */
  constructor(private readonly redisOptions: RedisDriverOptions) {
    super()
    this.options = {
      streamKeyPrefix: redisOptions.streamKeyPrefix ?? 'logs:',
      ttlSeconds: redisOptions.ttlSeconds ?? 86400,
    }
  }

  /**
   * @method initialize
   * @async
   * @description
   * - Establishes the Redis connection
   * - Enables the driver and marks it running
   *
   * @returns {Promise<void>}
   */
  public async initialize(): Promise<void> {
    this.enable()
    this.client = new Redis(this.redisOptions)
    await this.start()
  }

  /**
   * @method start
   * @async
   * @description
   * Marks the driver as actively processing logs.
   *
   * @returns {Promise<void>}
   */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /**
   * @method log
   * @async
   * @param {LogRecord} record - The structured log entry to store
   * @description
   * - Determines the Redis stream key by combining `streamKeyPrefix` and `metadata.category` or `'default'`.
   * - Uses {@link JSONFormatter} to serialize the record.
   * - Appends the JSON under field `'data'` to the Redis stream.
   * - Resets the TTL on the stream key to ensure eviction after `ttlSeconds`.
   *
   * If the driver is disabled, not running, or Redis is unavailable, this is a no-op.
   *
   * @returns {Promise<void>}
   * @throws {Error} Propagates Redis errors to be handled by external retry/fallback logic
   */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isEnabled() || !this.isRunning() || !this.client) return

    const category = record.metadata?.['category'] ?? 'default'
    const key = `${this.options.streamKeyPrefix}${category}`
    const data = this.formatter.format(record)

    await this.client.xadd(key, '*', 'data', data)
    await this.client.expire(key, this.options.ttlSeconds)
  }

  /**
   * @method stop
   * @async
   * @description
   * Prevents further log records from being processed.
   *
   * @returns {Promise<void>}
   */
  public async stop(): Promise<void> {
    this.setRunning(false)
  }

  /**
   * @method shutdown
   * @async
   * @description
   * - Stops the driver
   * - Closes the Redis connection gracefully
   * - Clears the client reference
   *
   * @returns {Promise<void>}
   */
  public async shutdown(): Promise<void> {
    await this.stop()
    if (this.client) {
      await this.client.quit()
      this.client = null
    }
  }
}
