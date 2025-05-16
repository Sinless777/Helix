import LokiTransport from 'winston-loki'
import type { LogRecord, LogLevel } from '../logger'
import { DriverBase } from './driver.base'

/**
 * Configuration options for Loki transport.
 */
export interface LokiDriverOptions {
  /** Loki server endpoint, e.g. 'http://localhost:3100' */
  host: string
  /** Stream labels to apply to all log entries */
  labels?: Record<string, string>
  /** HTTP Basic auth "user:pass" if required */
  basicAuth?: string
  /** Minimum log level for this driver */
  level?: LogLevel
  /** Enable JSON formatting of the log body */
  json?: boolean
}

/**
 * LokiDriver sends logs to Grafana Loki via the winston-loki transport.
 */
export class LokiDriver extends DriverBase {
  private transport?: InstanceType<typeof LokiTransport>

  constructor(private options: LokiDriverOptions) {
    super()
  }

  /**
   * Initialize the Loki transport and start the driver.
   */
  public async initialize(): Promise<void> {
    const { host, labels = {}, basicAuth, level, json = true } = this.options
    this.transport = new LokiTransport({ host, labels, basicAuth, level, json })
    await this.start()
  }

  /**
   * Start the driver and mark it as running.
   */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /**
   * Log a record to Loki; delegate to the transport.
   */
  public async log(record: LogRecord): Promise<void> {
    const transport: typeof LokiTransport | undefined = this.transport
    if (!this.isEnabled() || !this.isRunning() || !transport) {
      return
    } else {
      await new Promise<void>((resolve, reject) => {
        transport.log(
          { ...record, level: record.level, message: record.message },
          (err?: Error) => (err ? reject(err) : resolve()),
        )
      })
    }
  }

  /**
   * Stop the driver and mark it as not running.
   */
  public async stop(): Promise<void> {
    this.setRunning(false)
  }

  /**
   * Shutdown the driver and release resources.
   */
  public async shutdown(): Promise<void> {
    await this.stop()
  }
}
