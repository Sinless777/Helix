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
  /** Tag prefix to namespace logs (e.g. 'app') */
  tagPrefix?: string
  /** Connection timeout in seconds */
  timeout?: number
  /** Any other options passed to createFluentSender */
  [key: string]: any
}

/**
 * FluentdDriver pushes structured logs to Fluentd via fluent-logger.
 */
export class FluentdDriver extends DriverBase {
  private client: ReturnType<
    typeof fluentSupport.winstonTransport.createFluentSender
  > | null = null
  private options: Required<
    Pick<FluentdDriverOptions, 'host' | 'port' | 'tagPrefix' | 'timeout'>
  >

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
   * Instantiate Fluentd sender and start the driver.
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
   * Uses metadata.category or 'default' as tag suffix.
   */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isEnabled() || !this.isRunning() || !this.client) return

    const category = record.metadata?.['category'] ?? 'default'
    this.client.emit(category, record)
  }

  /**
   * Stop the driver.
   */
  public async stop(): Promise<void> {
    this.setRunning(false)
  }

  /**
   * Shutdown the driver and clear the client.
   */
  public async shutdown(): Promise<void> {
    await this.stop()
    this.client = null
  }
}
