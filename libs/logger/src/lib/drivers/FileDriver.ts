// libs/logger/src/lib/drivers/FileDriver.ts

import fs from 'fs'
import { DriverBase } from '../DriverBase'
import type { LogRecord } from '../../types/LogRecord'
import { FileFormatter } from '../formatters/FileFormatter'

/**
 * Configuration options for FileDriver.
 */
export interface FileDriverOptions {
  /** Path to the log file */
  filename: string
}

/**
 * Writes human-readable log messages to disk using FileFormatter.
 */
export class FileDriver extends DriverBase {
  private readonly formatter = new FileFormatter()

  /**
   * @param options - Configuration for the file driver.
   */
  constructor(private readonly options: FileDriverOptions) {
    super()
  }

  /**
   * Enables the driver, ensures the file exists, and marks it running.
   */
  public async initialize(): Promise<void> {
    this.enable()
    await this.start()
    // Create the file if it doesn't exist
    await fs.promises.appendFile(this.options.filename, '')
  }

  /**
   * Marks the driver as ready to accept log records.
   */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /**
   * Formats and appends a log record to the file.
   *
   * @param record - The log entry to write.
   * @remarks
   * No-op if the driver is disabled or not running.
   */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isEnabled() || !this.isRunning()) return
    const line = this.formatter.format(record) + '\n'
    await fs.promises.appendFile(this.options.filename, line, 'utf8')
  }

  /**
   * Stops the driver from accepting further log records.
   */
  public async stop(): Promise<void> {
    this.setRunning(false)
  }

  /**
   * Performs a graceful shutdown by stopping the driver.
   */
  public async shutdown(): Promise<void> {
    await this.stop()
  }
}
