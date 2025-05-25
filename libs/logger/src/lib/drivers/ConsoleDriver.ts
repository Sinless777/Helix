// libs/logger/src/lib/drivers/ConsoleDriver.ts

import chalk from 'chalk'
import { DriverBase } from '../DriverBase'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Writes human-readable logs to the terminal using Chalk.
 * Always enabled and cannot be disabled.
 */
export class ConsoleDriver extends DriverBase {
  /**
   * Constructs a ConsoleDriver and enables it by default.
   */
  constructor() {
    super()
    this.enable()
  }

  /**
   * Ensures the driver is enabled and marks it running.
   */
  public async initialize(): Promise<void> {
    this.enable()
    await this.start()
  }

  /**
   * Marks the driver as running.
   */
  public async start(): Promise<void> {
    this.setRunning(true)
  }

  /**
   * Logs a record to the console in a colorized, human-readable format.
   *
   * @param record - The log entry to output.
   * @remarks
   * Prints a tag like `[INFO] | message` where the level tag is colorized
   * according to the log level. The full record object follows for inspection.
   */
  public async log(record: LogRecord): Promise<void> {
    if (!this.isRunning()) return

    const { level, message } = record
    const colorFn = levelColorMap[level] || chalk.white
    const coloredTag = colorFn(`[${level.toUpperCase()}]`)

    console.log(`${coloredTag} | ${message}`, record)
  }

  /**
   * Marks the driver as not running.
   */
  public async stop(): Promise<void> {
    this.setRunning(false)
  }

  /**
   * Stops the driver (same as calling stop()).
   */
  public async shutdown(): Promise<void> {
    await this.stop()
  }
}

/**
 * Maps log levels to Chalk color functions.
 */
const levelColorMap: Record<string, typeof chalk> = {
  fatal: chalk.redBright,
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.green,
  debug: chalk.blue,
  trace: chalk.magenta,
  success: chalk.cyan,
}
