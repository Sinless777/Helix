// libs/logger/src/lib/drivers/ElasticsearchDriver.ts

import {
  ElasticsearchTransport,
  ElasticsearchTransportOptions,
} from 'winston-elasticsearch'
import { DriverBase } from '../DriverBase'
import type { LogRecord } from '../../types/LogRecord'
import { emitDriverError } from '../events'

/**
 * Configuration options for ElasticsearchDriver.
 * Inherits from Winston’s ElasticsearchTransportOptions, with an optional
 * `level` override to set the minimum log level.
 */
export interface ElasticsearchDriverOptions
  extends Partial<ElasticsearchTransportOptions> {
  /** Minimum log level to send (e.g. 'info') */
  level?: string
}

/**
 * Sends structured log records to Elasticsearch via the Winston Elasticsearch transport.
 * Manages initialization, error forwarding, and shutdown.
 */
export class ElasticsearchDriver extends DriverBase {
  private transport?: ElasticsearchTransport
  private readonly driverName = 'elasticsearch'

  /**
   * @param options - Configuration for the underlying Elasticsearch transport
   */
  constructor(private readonly options: ElasticsearchDriverOptions) {
    super()
  }

  /**
   * Initializes the Elasticsearch transport, hooks up error forwarding,
   * enables this driver, and marks it running.
   */
  public async initialize(): Promise<void> {
    this.transport = new ElasticsearchTransport(
      this.options as ElasticsearchTransportOptions,
    )
    this.transport.on('error', (err: Error) => {
      emitDriverError(this.driverName, err)
    })
    this.enable()
    await this.start()
  }

  /**
   * Marks this driver as running.
   */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /**
   * Sends a single log record to Elasticsearch.
   *
   * @param record - The log record to index
   * @returns A promise that resolves once the record is sent
   * @throws If the transport is not initialized or indexing fails
   */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isEnabled() || !this.isRunning() || !this.transport) {
      return
    }

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
            reject(err)
          } else {
            resolve()
          }
        })
      } else {
        const err = new Error('Elasticsearch transport not initialized')
        emitDriverError(this.driverName, err)
        reject(err)
      }
    })
  }

  /**
   * Stops accepting new log records.
   */
  public async stop(): Promise<void> {
    this.setRunning(false)
  }

  /**
   * Shuts down the transport:
   * stops the driver, flushes any buffered logs if supported, and cleans up.
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
