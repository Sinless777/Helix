// libs/logger/src/lib/formatters/ConsoleFormatter.ts

import chalk from 'chalk'
import type { Formatter } from '../../types/Formatter'
import type { LogRecord, LogLevel } from '../../types/LogRecord'

/**
 * Mapping from LogLevel to Chalk color functions.
 * Ensures consistent colorization for each log level.
 *
 * @private
 */
const levelColor: Record<LogLevel, (text: string) => string> = {
  fatal: chalk.redBright,
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.green,
  debug: chalk.blue,
  trace: chalk.magenta,
  success: chalk.cyan,
}

/**
 * Formatter that outputs colored, human-readable log messages to the console.
 *
 * Uses:
 * - Timestamp in gray
 * - Level label in color per level
 * - Italicized, dim context (if provided)
 * - Pretty-printed metadata JSON in gray
 *
 * @public
 * @class
 * @implements {Formatter}
 */
export class ConsoleFormatter implements Formatter {
  /**
   * Convert a LogRecord into a colored string.
   *
   * @param record - The structured log record to format.
   * @returns A single-line string, colorized and human-readable.
   *
   * @example
   * ```ts
   * const formatter = new ConsoleFormatter()
   * const msg = formatter.format({
   *   timestamp: new Date().toISOString(),
   *   level: 'info',
   *   service: 'auth',
   *   message: 'User login successful',
   *   context: 'AuthService.login',
   *   metadata: { userId: '123', ip: '127.0.0.1' }
   * })
   * console.log(msg)
   * // Outputs: "[2025-05-24T12:00:00.000Z] [INFO] User login successful (AuthService.login) { ... }"
   * ```
   */
  public format(record: LogRecord): string {
    const { timestamp, level, message, context, metadata } = record

    // 1. Colorize the level label (e.g. "[INFO]" in green)
    const coloredLevel = levelColor[level](`[${level.toUpperCase()}]`)

    // 2. Gray out the timestamp for secondary emphasis
    const ts = chalk.gray(timestamp)

    // 3. Build the main log line
    let output = `${ts} ${coloredLevel} ${message}`

    // 4. Append context in italicized dim font, if provided
    if (context) {
      output += ` ${chalk.italic.dim(`(${context})`)}`
    }

    // 5. Append metadata as JSON (pretty-printed), if provided
    if (metadata) {
      try {
        const metaStr = JSON.stringify(metadata, null, 2)
        output += ` ${chalk.gray(metaStr)}`
      } catch {
        // Fallback: stringify directly on failure
        output += ` ${chalk.gray(String(metadata))}`
      }
    }

    return output
  }
}
