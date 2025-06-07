// libs/logger/src/lib/drivers/FluentdDriver.ts

import { support as fluentSupport } from 'fluent-logger'
import { DriverBase } from '../DriverBase'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Options for FluentdDriver.
 */
export interface FluentdDriverOptions {
  /** Fluentd host (e.g. 'localhost') */
  host: string
  /** Fluentd port (e.g. 24224) */
  port: number
  /** Optional tag prefix (e.g. 'app') */
  tagPrefix?: string
  /** Connection timeout in seconds (default: 3) */
  timeout?: number
  /** Any additional options passed to Fluentd sender */
  [key: string]: any
}

/**
 * Sends structured log records to Fluentd via fluent-logger.
 */
export class FluentdDriver extends DriverBase {
  private client: ReturnType<
    typeof fluentSupport.winstonTransport.createFluentSender
  > | null = null

  private readonly options: Required<
    Pick<FluentdDriverOptions, 'host' | 'port' | 'tagPrefix' | 'timeout'>
  >

  /**
   * @param opts - Initialization options for FluentdDriver
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
   * Instantiate the Fluentd sender, enable and start the driver.
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
   * Mark the driver as running.
   */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /**
   * Emit a log record to Fluentd.
   *
   * @param record - Structured log record to send.
   * @remarks
   * Uses `metadata.category` as tag; defaults to 'default' if missing.
   * No-op if driver is disabled, not running, or not initialized.
   */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isEnabled() || !this.isRunning() || !this.client) return
    const category = (record.metadata?.['category'] as string) ?? 'default'
    this.client.emit(category, record)
  }

  /**
   * Stop accepting new log records.
   */
  public async stop(): Promise<void> {
    this.setRunning(false)
  }

  /**
   * Gracefully shut down the driver.
   *
   * @remarks
   * Stops the driver and clears the Fluentd client reference.
   */
  public async shutdown(): Promise<void> {
    await this.stop()
    this.client = null
  }
}
