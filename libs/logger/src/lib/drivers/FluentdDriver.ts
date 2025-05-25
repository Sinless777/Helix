// libs/logger/src/lib/drivers/FluentdDriver.ts

import { support as fluentSupport } from 'fluent-logger'
import { DriverBase } from '../DriverBase'
import type { LogRecord } from '../../types/LogRecord'

/**
 * @interface FluentdDriverOptions
 * @description
 * Configuration options for {@link FluentdDriver}.
 *
 * @property {string} host - Fluentd host (e.g. 'localhost').
 * @property {number} port - Fluentd port (e.g. 24224).
 * @property {string} [tagPrefix] - Optional prefix for tags (e.g. 'app').
 * @property {number} [timeout] - Connection timeout in seconds (default: 3).
 * @property {Record<string, any>} [key: string] - Any additional options passed to Fluentd sender.
 */
export interface FluentdDriverOptions {
  host: string
  port: number
  tagPrefix?: string
  timeout?: number
  [key: string]: any
}

/**
 * @class FluentdDriver
 * @extends DriverBase
 * @description
 * Sends structured log records to Fluentd using the `fluent-logger` transport.
 * Tags records by their `metadata.category` or falls back to 'default'.
 */
export class FluentdDriver extends DriverBase {
  /** @private - Underlying Fluentd client instance */
  private client: ReturnType<
    typeof fluentSupport.winstonTransport.createFluentSender
  > | null = null

  /** @private - Normalized, required options */
  private readonly options: Required<
    Pick<FluentdDriverOptions, 'host' | 'port' | 'tagPrefix' | 'timeout'>
  >

  /**
   * @constructor
   * @param {FluentdDriverOptions} opts - Initialization options for FluentdDriver.
   */
  constructor(opts: FluentdDriverOptions) {
    super()
    this.options = {
      host: opts.host,
      port: opts.port,
      tagPrefix: opts.tagPrefix ?? '',
      timeout: opts.timeout ?? 3,
    }
  }

  /**
   * @method initialize
   * @async
   * @description
   * - Instantiates the Fluentd sender via `createFluentSender`
   * - Enables and starts the driver
   * - Connection options include host, port, timeout
   *
   * @returns {Promise<void>}
   */
  public async initialize(): Promise<void> {
    this.client = fluentSupport.winstonTransport.createFluentSender(
      this.options.tagPrefix,
      {
        host: this.options.host,
        port: this.options.port,
        timeout: this.options.timeout,
      },
    )
    this.enable()
    await this.start()
  }

  /**
   * @method start
   * @async
   * @description
   * Marks the driver as running, allowing it to accept logs.
   *
   * @returns {Promise<void>}
   */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /**
   * @method log
   * @async
   * @param {LogRecord} record - Structured log record to send.
   * @description
   * Emits the `record` to Fluentd under the tag composed of `tagPrefix` and `category`.
   * If `metadata.category` is not present, defaults to 'default'.
   * No-op if driver is disabled, not running, or client is uninitialized.
   *
   * @returns {Promise<void>}
   */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isEnabled() || !this.isRunning() || !this.client) return

    const category = (record.metadata?.['category'] as string) ?? 'default'
    this.client.emit(category, record)
  }

  /**
   * @method stop
   * @async
   * @description
   * Stops the driver from accepting new log records.
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
   * Gracefully shuts down the FluentdDriver:
   * - Stops the driver
   * - Clears the internal client reference for GC
   *
   * @returns {Promise<void>}
   */
  public async shutdown(): Promise<void> {
    await this.stop()
    this.client = null
  }
}
