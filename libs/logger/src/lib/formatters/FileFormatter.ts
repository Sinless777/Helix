// libs/logger/src/lib/formatters/FileFormatter.ts

import type { Formatter } from '../../types/Formatter'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Outputs human-readable, single-line log messages for file storage.
 *
 * Format:
 * ```
 * [TIMESTAMP] [LEVEL] Message (Context) {"metaKey":"metaValue",...}
 * ```
 * - Timestamp in ISO format, enclosed in brackets.
 * - Log level uppercased, enclosed in brackets.
 * - Message text.
 * - Optional context in parentheses.
 * - Optional metadata as compact JSON.
 *
 * @example
 * ```ts
 * const fmt = new FileFormatter()
 * console.log(fmt.format({
 *   timestamp: new Date().toISOString(),
 *   level: 'error',
 *   message: 'Transaction failed',
 *   context: 'PaymentService.process',
 *   metadata: { orderId: 'abc123', amount: 99.99 }
 * }))
 * // => "[2025-05-24T12:00:00.000Z] [ERROR] Transaction failed (PaymentService.process) {"orderId":"abc123","amount":99.99}"
 * ```
 */
export class FileFormatter implements Formatter {
  /**
   * Convert a LogRecord into a formatted string for file output.
   *
   * @param record - The structured log record to format.
   * @returns A single-line string ready for writing to a log file.
   */
  public format(record: LogRecord): string {
    const { timestamp, level, message, context, metadata } = record

    // Base line with timestamp and level
    let output = `[${timestamp}] [${level.toUpperCase()}] ${message}`

    // Append context if present
    if (context) {
      output += ` (${context})`
    }

    // Append compact metadata JSON if present
    if (metadata) {
      try {
        const metaStr = JSON.stringify(metadata)
        output += ` ${metaStr}`
      } catch {
        // Fallback in case of circular references
        output += ` ${String(metadata)}`
      }
    }

    return output
  }
}
