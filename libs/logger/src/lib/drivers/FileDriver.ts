// libs/logger/src/lib/drivers/FileDriver.ts

import fs from 'fs'
import { DriverBase } from '../DriverBase'
import type { LogRecord } from '../../types/LogRecord'
import { FileFormatter } from '../formatters/FileFormatter'

/**
 * @interface FileDriverOptions
 * @description
 * Configuration options for {@link FileDriver}.
 *
 * @property {string} filename - Path to the log file.
 */
export interface FileDriverOptions {
  filename: string
}

/**
 * @class FileDriver
 * @extends DriverBase
 * @description
 * Writes human-readable log messages to disk.
 * Utilizes {@link FileFormatter} to format each record before appending it.
 */
export class FileDriver extends DriverBase {
  /** @private */
  private readonly formatter = new FileFormatter()

  /**
   * @param options - Configuration for the file driver.
   */
  constructor(private readonly options: FileDriverOptions) {
    super()
  }

  /**
   * @method initialize
   * @async
   * @description
   * - Enables the driver
   * - Ensures the log file exists (creates if missing)
   * - Marks the driver as running
   *
   * @returns {Promise<void>}
   */
  public async initialize(): Promise<void> {
    this.enable()
    await this.start()
    // Ensure the log file exists by appending an empty string
    await fs.promises.appendFile(this.options.filename, '')
  }

  /**
   * @method start
   * @async
   * @description
   * Marks the driver as ready to accept log records.
   *
   * @returns {Promise<void>}
   */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /**
   * @method log
   * @async
   * @param {LogRecord} record - Structured log record to write.
   * @description
   * Formats the record into a human-readable line and appends it to the file.
   * No-ops if the driver is disabled or not running.
   *
   * @returns {Promise<void>}
   */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isEnabled() || !this.isRunning()) return

    const line = this.formatter.format(record) + '\n'
    await fs.promises.appendFile(this.options.filename, line, 'utf8')
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
   * Gracefully shuts down the driver by stopping it.
   * Does not delete or rotate the log file.
   *
   * @returns {Promise<void>}
   */
  public async shutdown(): Promise<void> {
    await this.stop()
  }
}
