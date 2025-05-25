// libs/logger/src/lib/drivers/LokiDriver.ts

import LokiTransport from 'winston-loki'
import { DriverBase } from '../DriverBase'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Options for LokiDriver.
 */
export interface LokiDriverOptions {
  /** Loki server URL (e.g. 'http://localhost:3100') */
  host: string
  /** Default labels applied to every log (e.g. `{ app: "myapp" }`) */
  labels?: Record<string, string>
  /** Batch size for sending logs */
  batchSize?: number
  /** Maximum wait time before flushing batch (ms) */
  timeout?: number
  /** Send logs as JSON payload */
  json?: boolean
  /** Any additional options supported by winston-loki */
  [key: string]: any
}

/**
 * Sends structured log records into Grafana Loki via winston-loki.
 */
export class LokiDriver extends DriverBase {
  private transport?: any
  private readonly options: LokiDriverOptions

  /**
   * @param opts - Initialization options for this driver
   */
  constructor(opts: LokiDriverOptions) {
    super()
    this.options = opts
  }

  /**
   * Instantiate the Loki transport and start processing.
   */
  public async initialize(): Promise<void> {
    this.transport = new LokiTransport(this.options)
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
   * Send a log record to Loki.
   *
   * @param record - The structured log record to send.
   * @remarks
   * Transforms the record into the shape expected by winston-loki:
   * - message: record.message
   * - labels: merge of record.metadata and configured labels
   * - timestamp: record.timestamp
   */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isEnabled() || !this.isRunning() || !this.transport) return

    const payload = {
      message: record.message,
      labels: {
        ...(record.metadata as Record<string, string>),
        ...(this.options.labels || {}),
      },
      timestamp: record.timestamp,
    }

    await new Promise<void>((resolve, reject) => {
      this.transport.log(payload, (err: Error) => {
        if (err) return reject(err)
        resolve()
      })
    })
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
   * Stops the driver and releases the transport reference.
   */
  public async shutdown(): Promise<void> {
    await this.stop()
    this.transport = undefined
  }
}
