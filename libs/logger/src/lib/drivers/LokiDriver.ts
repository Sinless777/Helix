import LokiTransport from 'winston-loki'
import { DriverBase } from '../DriverBase'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Options for LokiDriver, passed directly to winston-loki transport.
 */
export interface LokiDriverOptions {
  /** Loki server URL (e.g. http://localhost:3100) */
  host: string
  /** Default labels to apply to every log (e.g. { app: "myapp" }) */
  labels?: Record<string, string>
  /** Batch size for log pushes */
  batchSize?: number
  /** Maximum wait time before flushing batch (ms) */
  timeout?: number
  /** Whether to send logs as JSON */
  json?: boolean
  /** Additional winston-loki options */
  [key: string]: any
}

/**
 * LokiDriver pushes structured logs into Grafana Loki via winston-loki.
 */
export class LokiDriver extends DriverBase {
  private transport?: any
  private options: LokiDriverOptions

  constructor(opts: LokiDriverOptions) {
    super()
    this.options = opts
  }

  /** Initialize the Loki transport and start processing. */
  public async initialize(): Promise<void> {
    this.transport = new LokiTransport(this.options)
    this.enable()
    await this.start()
  }

  /** Mark the driver as running. */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /** Send a log record to Loki. */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isEnabled() || !this.isRunning() || !this.transport) return

    // Winston-loki expects an object with 'message', 'labels', and optional 'timestamp'
    const payload = {
      message: record.message,
      labels: {
        ...(record.metadata as Record<string, string>),
        ...this.options.labels,
      },
      timestamp: record.timestamp,
    }

    await new Promise<void>((resolve, reject) => {
      this.transport.log(payload, (err: Error) =>
        err ? reject(err) : resolve(),
      )
    })
  }

  /** Stop the driver. */
  public async stop(): Promise<void> {
    this.setRunning(false)
  }

  /** Shutdown the driver and release resources. */
  public async shutdown(): Promise<void> {
    await this.stop()
    this.transport = undefined
  }
}
