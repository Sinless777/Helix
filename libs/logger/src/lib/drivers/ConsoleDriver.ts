import chalk from 'chalk'
import { DriverBase } from '../DriverBase'
import type { LogRecord } from '../../types/LogRecord'

/**
 * ConsoleDriver writes human-readable logs to the terminal using Chalk.
 * Always enabled and cannot be disabled.
 */
export class ConsoleDriver extends DriverBase {
  constructor() {
    super()
    this.enable() // Console should always be enabled
  }

  /**
   * Initialize and start the console driver.
   */
  public async initialize(): Promise<void> {
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
   * Log a record to the console in human-readable form.
   * Format: [LEVEL] | message <record object>
   */
  public async log(record: LogRecord): Promise<void> {
    // Always output since console is non-disableable after initialization
    if (!this.isRunning()) return

    // Choose color based on level
    const level = record.level
    const levelTag = (levelColorMap[level] || chalk.white)(
      `[${level.toUpperCase()}]`,
    )

    // Output tag, message, and full record object
    console.log(`[${levelTag}] | ${record.message}`, record)
  }

  /**
   * Stop the console driver.
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

/**
 * Mapping of log levels to Chalk color functions.
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
