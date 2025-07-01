import { transports } from "winston";
import type { FileTransportOptions } from "winston/lib/winston/transports";
import { DriverBase } from "./driver.base";
import type { LogRecord, LogLevel } from "../logger";

/**
 * Options specific to FileDriver, extending Winston's File transport options.
 */
export interface FileDriverOptions extends FileTransportOptions {
  /**
   * Path to the log file.
   */
  filename: string;
  /**
   * Optional override for log level in this file.
   */
  level?: LogLevel;
}

/**
 * FileDriver writes logs to disk using Winston's File transport.
 */
export class FileDriver extends DriverBase {
  private transport!: transports.FileTransportInstance;

  constructor(private options: FileDriverOptions) {
    super();
  }

  /**
   * Instantiate the Winston File transport.
   */
  public async initialize(): Promise<void> {
    this.transport = new transports.File(this.options);
    await this.start();
  }

  /**
   * Mark the driver as running.
   */
  public async start(): Promise<void> {
    this.setRunning(true);
  }

  /**
   * Log a record by delegating to the Winston File transport.
   */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isEnabled() || !this.isRunning() || !this.transport) {
      return;
    }
    await new Promise<void>((resolve, reject) => {
      // @ts-expect-error: transport.log is always defined after initialize
      this.transport.log(
        { ...record, level: record.level as string },
        (err?: Error) => (err ? reject(err) : resolve()),
      );
    });
  }

  /**
   * Mark the driver as stopped.
   */
  public async stop(): Promise<void> {
    this.setRunning(false);
  }

  /**
   * Shutdown the driver; simply stop writing.
   */
  public async shutdown(): Promise<void> {
    await this.stop();
  }
}
