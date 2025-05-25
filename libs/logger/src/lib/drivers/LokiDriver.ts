// libs/logger/src/lib/drivers/LokiDriver.ts

import LokiTransport from 'winston-loki'
import { DriverBase } from '../DriverBase'
import type { LogRecord } from '../../types/LogRecord'

/**
 * @interface LokiDriverOptions
 * @description
 * Configuration options for {@link LokiDriver}, passed to the winston-loki transport.
 *
 * @property {string} host - URL of the Loki server (e.g. 'http://localhost:3100').
 * @property {Record<string,string>} [labels] - Default labels to attach to every log entry (e.g. `{ app: "myapp" }`).
 * @property {number} [batchSize] - Maximum number of log entries to batch before sending.
 * @property {number} [timeout] - Maximum wait time in milliseconds before flushing a partial batch.
 * @property {boolean} [json] - Whether to send logs as JSON payloads.
 * @property {Record<string, any>} [key: string] - Any additional options supported by winston-loki.
 */
export interface LokiDriverOptions {
  host: string
  labels?: Record<string, string>
  batchSize?: number
  timeout?: number
  json?: boolean
  [key: string]: any
}

/**
 * @class LokiDriver
 * @extends DriverBase
 * @description
 * Sends structured log records into Grafana Loki using the `winston-loki` transport.
 * Handles batching, labeling, and timestamp formatting.
 */
export class LokiDriver extends DriverBase {
  /** @private The underlying winston-loki transport instance */
  private transport?: any

  /** @private Configuration for this driver */
  private readonly options: LokiDriverOptions

  /**
   * @constructor
   * @param {LokiDriverOptions} opts - Initialization options for LokiDriver
   */
  constructor(opts: LokiDriverOptions) {
    super()
    this.options = opts
  }

  /**
   * @method initialize
   * @async
   * @description
   * - Instantiates the {@link LokiTransport} with provided options
   * - Enables and starts the driver so it begins accepting logs
   *
   * @returns {Promise<void>}
   */
  public async initialize(): Promise<void> {
    this.transport = new LokiTransport(this.options)
    this.enable()
    await this.start()
  }

  /**
   * @method start
   * @async
   * @description
   * Marks the driver as running, allowing `log()` calls to dispatch to Loki.
   *
   * @returns {Promise<void>}
   */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /**
   * @method log
   * @async
   * @param {LogRecord} record - The structured log record to send to Loki.
   * @description
   * Transforms the {@link LogRecord} into the payload shape expected by `winston-loki`:
   * - `message`: the log message
   * - `labels`: merged from record.metadata and configured defaults
   * - `timestamp`: ISO string
   *
   * No-op if the driver is disabled, not running, or transport is uninitialized.
   *
   * @returns {Promise<void>} resolves when the entry has been enqueued or sent
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
   * @method stop
   * @async
   * @description
   * Stops the driver from processing further log records.
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
   * Gracefully shuts down the driver:
   * - Stops accepting new logs
   * - Releases the transport reference for garbage collection
   *
   * @returns {Promise<void>}
   */
  public async shutdown(): Promise<void> {
    await this.stop()
    this.transport = undefined
  }
}
