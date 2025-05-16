import { support as fluentSupport } from 'fluent-logger'
import type { LogRecord, LogLevel } from '../logger'
import { DriverBase } from './driver.base'

/**
 * Configuration options for Fluentd transport.
 */
export interface FluentdDriverOptions {
  /** Fluentd server host. */
  host: string
  /** Fluentd server port. */
  port: number
  /** Tag prefix for Fluentd events. @default 'winston' */
  tag?: string
  /** Timeout in seconds for sending logs. @default 3.0 */
  timeout?: number
  /** Require acknowledgement from Fluentd. @default true */
  requireAckResponse?: boolean
  /** Minimum log level for this driver. */
  level?: LogLevel
}

// Winston transport constructor from fluent-logger
const FluentTransportCtor = fluentSupport.winstonTransport()

/**
 * FluentdDriver sends logs to a Fluentd/Fluent Bit collector
 * using fluent-logger's Winston transport.
 */
export class FluentdDriver extends DriverBase {
  private transport?: InstanceType<typeof FluentTransportCtor>

  constructor(private options: FluentdDriverOptions) {
    super()
  }

  /** Initialize the Fluentd transport and start the driver. */
  public async initialize(): Promise<void> {
    const {
      host,
      port,
      tag = 'winston',
      timeout = 3.0,
      requireAckResponse = true,
      level,
    } = this.options

    // Create a new Fluentd transport for Winston 3.x
    this.transport = new FluentTransportCtor(tag, {
      host,
      port,
      timeout,
      requireAckResponse,
      level,
    })
    await this.start()
  }

  /** Start the driver’s active processing. */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /** Log a record to Fluentd. */
  public async log(record: LogRecord): Promise<void> {
    const transport = this.transport
    if (!this.isEnabled() || !this.isRunning() || !transport) {
      return
    }
    await new Promise<void>((resolve, reject) => {
      transport.log(record.level as string, record, (err?: Error) =>
        err ? reject(err) : resolve(),
      )
    })
  }

  /** Stop the driver’s active processing. */
  public async stop(): Promise<void> {
    this.setRunning(false)
  }

  /** Shutdown the driver and release resources. */
  public async shutdown(): Promise<void> {
    await this.stop()
  }
}
