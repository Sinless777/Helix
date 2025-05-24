import fs from 'fs'
import { DriverBase } from '../DriverBase'
import type { LogRecord } from '../../types/LogRecord'
import { FileFormatter } from '../formatters/FileFormatter'

/**
 * Options for FileDriver, specifying output filename.
 */
export interface FileDriverOptions {
  /** Path to the log file */
  filename: string
}

/**
 * FileDriver writes human-readable log messages to disk.
 * Uses FileFormatter for text formatting.
 */
export class FileDriver extends DriverBase {
  private formatter = new FileFormatter()

  constructor(private options: FileDriverOptions) {
    super()
  }

  /**
   * Initialize and start the file driver.
   */
  public async initialize(): Promise<void> {
    this.enable()
    await this.start()
    // Ensure log file exists
    await fs.promises.appendFile(this.options.filename, '')
  }

  /**
   * Mark the driver as running.
   */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /**
   * Log a record to the file in human-readable format.
   */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isEnabled() || !this.isRunning()) return

    const line = this.formatter.format(record) + '\n'
    await fs.promises.appendFile(this.options.filename, line, 'utf8')
  }

  /**
   * Stop the file driver.
   */
  public async stop(): Promise<void> {
    this.setRunning(false)
  }

  /**
   * Shutdown simply stops the driver.
   */
  public async shutdown(): Promise<void> {
    await this.stop()
  }
}
