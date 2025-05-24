import {
  ElasticsearchTransport,
  ElasticsearchTransportOptions,
} from 'winston-elasticsearch'
import { DriverBase } from '../DriverBase'
import type { LogRecord } from '../../types/LogRecord'
import { emitDriverError } from '../events'

/**
 * Options for ElasticsearchDriver, passed to winston-elasticsearch transport.
 */
export interface ElasticsearchDriverOptions
  extends Partial<ElasticsearchTransportOptions> {
  /** Minimum log level to send (e.g. 'info') */
  level?: string
}

/**
 * ElasticsearchDriver pushes logs into Elasticsearch using winston-elasticsearch.
 */
export class ElasticsearchDriver extends DriverBase {
  /** Underlying winston-elasticsearch transport instance */
  private transport?: ElasticsearchTransport

  /** Identifier for error events */
  private driverName = 'elasticsearch'

  constructor(private options: ElasticsearchDriverOptions) {
    super()
  }

  /**
   * Initialize the transport and begin processing.
   */
  public async initialize(): Promise<void> {
    this.transport = new ElasticsearchTransport(
      this.options as ElasticsearchTransportOptions,
    )
    // Report internal transport errors
    this.transport.on('error', (err: Error) => {
      emitDriverError(this.driverName, err)
    })
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
   * Send a log record to Elasticsearch.
   * @param record The log entry
   */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isEnabled() || !this.isRunning() || !this.transport) {
      return
    }
    const entry = {
      level: record.level as string,
      message: record.message,
      timestamp: record.timestamp,
      ...record.metadata,
    }
    return new Promise<void>((resolve, reject) => {
      if (this.transport && this.transport.log) {
        this.transport.log(entry, (err?: Error) => {
          if (err) {
            emitDriverError(this.driverName, err)
            return reject(err)
          }
          resolve()
        })
      } else {
        const error = new Error('Transport not initialized')
        emitDriverError(this.driverName, error)
        return reject(error)
      }
    })
  }

  /**
   * Stop accepting new logs.
   */
  public async stop(): Promise<void> {
    this.setRunning(false)
  }

  /**
   * Flush buffered logs (if any) and clean up.
   */
  public async shutdown(): Promise<void> {
    await this.stop()
    // Flush any pending logs if supported
    this.transport?.flush()
    this.transport = undefined
  }
}
