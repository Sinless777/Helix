// libs/logger/src/lib/drivers/ConsoleDriver.ts

import chalk from 'chalk'
import { DriverBase } from '../DriverBase'
import type { LogRecord } from '../../types/LogRecord'

/**
 * ConsoleDriver writes human-readable logs to the terminal using Chalk.
 * It is always enabled and cannot be disabled.
 *
 * @class
 * @extends DriverBase
 */
export class ConsoleDriver extends DriverBase {
  /**
   * Create a new ConsoleDriver instance.
   * Ensures the driver is enabled by default.
   */
  constructor() {
    super()
    this.enable()
  }

  /**
   * Initialize the ConsoleDriver.
   * For console, this simply ensures it is enabled and running.
   *
   * @returns Promise<void>
   */
  public async initialize(): Promise<void> {
    this.enable()
    await this.start()
  }

  /**
   * Start the ConsoleDriver’s processing.
   * Marks the driver as running.
   *
   * @returns Promise<void>
   */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /**
   * Log a record to the console in human-readable form.
   *
   * @param record - The log entry to output
   * @returns Promise<void>
   *
   * @remarks
   * Format: [LEVEL] | message <record object>
   * Level tag is colorized based on the log level.
   */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isRunning()) return

    const { level, message } = record

    // Colorize the level tag
    const tagFn = levelColorMap[level] || chalk.white
    const levelTag = tagFn(`[${level.toUpperCase()}]`)

    // Output to console
    console.log(`${levelTag} | ${message}`, record)
  }

  /**
   * Stop the ConsoleDriver.
   * Marks the driver as not running.
   *
   * @returns Promise<void>
   */
  public async stop(): Promise<void> {
    this.setRunning(false)
  }

  /**
   * Shutdown the ConsoleDriver.
   * For console, shutdown is equivalent to stop.
   *
   * @returns Promise<void>
   */
  public async shutdown(): Promise<void> {
    await this.stop()
  }
}

/**
 * Mapping of log levels to Chalk color functions.
 *
 * @constant
 * @private
 */
const levelColorMap: Record<string, typeof chalk.red> = {
  fatal: chalk.redBright,
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.green,
  debug: chalk.blue,
  trace: chalk.magenta,
  success: chalk.cyan,
}
