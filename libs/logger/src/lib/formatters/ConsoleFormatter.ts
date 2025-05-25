// libs/logger/src/lib/formatters/ConsoleFormatter.ts

import chalk from 'chalk'
import type { Formatter } from '../../types/Formatter'
import type { LogRecord, LogLevel } from '../../types/LogRecord'

/**
 * Mapping from log levels to Chalk color functions.
 * Ensures consistent colorization for each level.
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
 * Formatter that renders structured log records as colored, human-readable strings
 * for console output.
 *
 * - Timestamp is shown in gray.
 * - Level label is colorized per level.
 * - Optional context is italicized and dimmed.
 * - Optional metadata is pretty-printed in gray JSON.
 *
 */
export class ConsoleFormatter implements Formatter {
  /**
   * Format a log record for console output.
   *
   * @param record - The log record to format.
   * @returns A single-line, colorized string.
   *
   * @example
   * ```ts
   * const fmt = new ConsoleFormatter()
   * console.log(fmt.format({
   *   timestamp: new Date().toISOString(),
   *   level: 'info',
   *   message: 'User signed in',
   *   context: 'AuthService.login',
   *   metadata: { userId: '42' },
   * }))
   * ```
   */
  public format(record: LogRecord): string {
    const { timestamp, level, message, context, metadata } = record

    // Colorize level tag, e.g. "[INFO]" in green
    const coloredLevel = levelColor[level](`[${level.toUpperCase()}]`)

    // Gray timestamp
    const ts = chalk.gray(timestamp)

    // Build the main line
    let output = `${ts} ${coloredLevel} ${message}`

    // Add context if present
    if (context) {
      output += ` ${chalk.italic.dim(`(${context})`)}`
    }

    // Add metadata if present
    if (metadata) {
      try {
        const metaStr = JSON.stringify(metadata, null, 2)
        output += ` ${chalk.gray(metaStr)}`
      } catch {
        output += ` ${chalk.gray(String(metadata))}`
      }
    }

    return output
  }
}
