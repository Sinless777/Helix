import Redis, { RedisOptions } from 'ioredis'
import { DriverBase } from '../DriverBase'
import { JSONFormatter } from '../formatters/JSONFormatter'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Options for RedisDriver.
 */
export interface RedisDriverOptions extends RedisOptions {
  /**
   * Prefix for Redis stream keys. Actual key: `${streamKeyPrefix}${category}`
   * Defaults to 'logs:'.
   */
  streamKeyPrefix?: string;

  /**
   * Time-to-live for each stream key, in seconds.
   * Defaults to 86400 (24 hours).
   */
  ttlSeconds?: number;
}

/**
 * RedisDriver pushes log records into per-category Redis streams.
 * Key pattern: `${streamKeyPrefix}${category}` with TTL eviction.
 */
export class RedisDriver extends DriverBase {
  private client: Redis | null = null
  private formatter = new JSONFormatter()
  private options: Required<Pick<RedisDriverOptions, 'streamKeyPrefix' | 'ttlSeconds'>>

  constructor(private redisOptions: RedisDriverOptions) {
    super()
    this.options = {
      streamKeyPrefix: redisOptions.streamKeyPrefix || 'logs:',
      ttlSeconds: redisOptions.ttlSeconds ?? 86400,
    }
  }

  /**
   * Initialize Redis client and start driver.
   */
  public async initialize(): Promise<void> {
    this.enable()
    this.client = new Redis(this.redisOptions)
    await this.start()
  }

  /**
   * Mark the driver as running.
   */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /**
   * Log a record by adding it to a Redis stream.
   * Expects `metadata.category` to route per-category.
   */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isEnabled() || !this.isRunning() || !this.client) return

    const category = record.metadata?.['category'] ?? 'default'
    const key = `${this.options.streamKeyPrefix}${category}`
    const data = this.formatter.format(record)

    try {
      // Push into stream: field 'data' holds JSON
      await this.client.xadd(key, '*', 'data', data)
      // Ensure stream key TTL
      await this.client.expire(key, this.options.ttlSeconds)
    } catch (err) {
      // On error, emit via driver error handling externally
      throw err
    }
  }

  /**
   * Stop the driver.
   */
  public async stop(): Promise<void> {
    this.setRunning(false)
  }

  /**
   * Shutdown the driver and close Redis connection.
   */
  public async shutdown(): Promise<void> {
    await this.stop()
    if (this.client) {
      await this.client.quit()
      this.client = null
    }
  }
}
