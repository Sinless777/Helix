// libs/logger/src/lib/drivers/ElasticsearchDriver.ts

import {
  ElasticsearchTransport,
  ElasticsearchTransportOptions,
} from 'winston-elasticsearch'
import { DriverBase } from '../DriverBase'
import type { LogRecord } from '../../types/LogRecord'
import { emitDriverError } from '../events'

/**
 * @interface ElasticsearchDriverOptions
 * @extends Partial<ElasticsearchTransportOptions>
 * @description
 * Configuration options for the {@link ElasticsearchDriver}.
 * Inherits all transport options from `winston-elasticsearch` and
 * allows overriding the minimum log level.
 *
 * @property {string} [level] - Minimum log level to send (e.g. 'info')
 * @property {string} [indexPrefix] - Prefix for Elasticsearch indices
 * @property {object} [clientOpts] - Custom Elasticsearch client options
 */
export interface ElasticsearchDriverOptions
  extends Partial<ElasticsearchTransportOptions> {
  level?: string
}

/**
 * @class ElasticsearchDriver
 * @extends DriverBase
 * @description
 * Driver that sends log records to Elasticsearch using the
 * `winston-elasticsearch` transport.
 * Handles initialization, error forwarding, and graceful shutdown.
 */
export class ElasticsearchDriver extends DriverBase {
  /** @private */
  private transport?: ElasticsearchTransport

  /** @private */
  private readonly driverName = 'elasticsearch'

  /**
   * @param options - Transport configuration for ElasticsearchDriver
   */
  constructor(private readonly options: ElasticsearchDriverOptions) {
    super()
  }

  /**
   * @method initialize
   * @async
   * @description
   * - Instantiates the ElasticsearchTransport
   * - Subscribes to transport 'error' events to re-emit via {@link emitDriverError}
   * - Enables and starts the driver
   *
   * @returns {Promise<void>}
   */
  public async initialize(): Promise<void> {
    this.transport = new ElasticsearchTransport(
      this.options as ElasticsearchTransportOptions,
    )
    this.transport.on('error', (err: Error) =>
      emitDriverError(this.driverName, err),
    )
    this.enable()
    await this.start()
  }

  /**
   * @method start
   * @async
   * @description Marks the driver as running.
   *
   * @returns {Promise<void>}
   */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /**
   * @method log
   * @async
   * @param {LogRecord} record - The structured log record to send
   * @description
   * Sends the record to Elasticsearch. Builds a flat payload
   * from `record.level`, `record.message`, `record.timestamp`,
   * and `record.metadata`. On failure, emits a driver error.
   *
   * @returns {Promise<void>}
   * @throws Will reject if the transport is not initialized or logging fails.
   */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isEnabled() || !this.isRunning() || !this.transport) return

    const entry = {
      level: record.level,
      message: record.message,
      timestamp: record.timestamp,
      ...record.metadata,
    }

    return new Promise<void>((resolve, reject) => {
      if (typeof this.transport!.log === 'function') {
        this.transport!.log(entry, (err?: Error) => {
          if (err) {
            emitDriverError(this.driverName, err)
            return reject(err)
          }
          resolve()
        })
      } else {
        const error = new Error('Elasticsearch transport not initialized')
        emitDriverError(this.driverName, error)
        reject(error)
      }
    })
  }

  /**
   * @method stop
   * @async
   * @description Stops accepting new log records.
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
   * - Flushes any buffered logs if supported
   * - Cleans up the transport instance
   *
   * @returns {Promise<void>}
   */
  public async shutdown(): Promise<void> {
    await this.stop()
    if (this.transport?.flush) {
      try {
        this.transport.flush()
      } catch (err: any) {
        emitDriverError(this.driverName, err)
      }
    }
    this.transport = undefined
  }
}
