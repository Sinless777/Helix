import ElasticsearchTransport from 'winston-elasticsearch'
import { DriverBase } from '../DriverBase'
import type { LogRecord } from '../../types/LogRecord'
import type { ElasticsearchTransportOptions } from 'winston-elasticsearch'

/**
 * Options for ElasticsearchDriver, extending winston-elasticsearch options.
 */
export interface ElasticsearchDriverOptions
  extends ElasticsearchTransportOptions {
  /**
   * Optional index prefix (default: 'logs-')
   */
  indexPrefix?: string
}

/**
 * ElasticsearchDriver pushes structured logs into Elasticsearch via winston-elasticsearch.
 */
export class ElasticsearchDriver extends DriverBase {
  private transport?: typeof ElasticsearchTransport
  private options: ElasticsearchDriverOptions

  constructor(opts: ElasticsearchDriverOptions) {
    super()
    this.options = opts
  }

  /**
   * Initialize the Elasticsearch transport and start processing.
   */
  public async initialize(): Promise<void> {
    // Setup transport with index prefix and provided options
    this.transport = new ElasticsearchTransport({
      indexPrefix: this.options.indexPrefix || 'logs-',
      ...this.options,
    })
    this.enable()
    await this.start()
  }

  /** Mark the driver as running. */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /** Send a log record to Elasticsearch. */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isEnabled() || !this.isRunning() || !this.transport) return

    // Compose log entry merging metadata into the body
    const entry = {
      '@timestamp': record.timestamp,
      level: record.level,
      message: record.message,
      ...record.metadata,
    }

    await new Promise<void>((resolve, reject) => {
      this.transport!.log(entry, (err?: Error) =>
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
