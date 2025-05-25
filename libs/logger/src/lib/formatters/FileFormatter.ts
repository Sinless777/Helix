// libs/logger/src/lib/formatters/FileFormatter.ts

import type { Formatter } from '../../types/Formatter'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Formatter that outputs human-readable log messages for file storage.
 *
 * Produces a concise, single-line text format suitable for log files,
 * without colorization, and with optional context and metadata.
 *
 * @public
 * @class
 * @implements {Formatter}
 */
export class FileFormatter implements Formatter {
  /**
   * Convert a LogRecord into a formatted string for file output.
   *
   * Format:
   * ```
   * [TIMESTAMP] [LEVEL] Message (Context) {"metaKey":"metaValue",...}
   * ```
   *
   * - Timestamp in ISO format, enclosed in `[]`.
   * - Log level uppercased, enclosed in `[]`.
   * - Message text.
   * - Optional context in parentheses.
   * - Optional metadata as compact JSON.
   *
   * @param record - The structured log record to format.
   * @returns A single-line string ready for writing to a log file.
   *
   * @example
   * ```ts
   * const formatter = new FileFormatter()
   * const line = formatter.format({
   *   timestamp: new Date().toISOString(),
   *   level: 'error',
   *   service: 'payment',
   *   message: 'Transaction failed',
   *   context: 'PaymentService.process',
   *   metadata: { orderId: 'abc123', amount: 99.99 }
   * })
   * // "[2025-05-24T12:00:00.000Z] [ERROR] Transaction failed (PaymentService.process) {"orderId":"abc123","amount":99.99}"
   * ```
   */
  public format(record: LogRecord): string {
    const { timestamp, level, message, context, metadata } = record

    // 1. Base line with timestamp and level
    let output = `[${timestamp}] [${level.toUpperCase()}] ${message}`

    // 2. Append context if provided
    if (context) {
      output += ` (${context})`
    }

    // 3. Append compact metadata JSON if provided
    if (metadata) {
      try {
        const metaStr = JSON.stringify(metadata)
        output += ` ${metaStr}`
      } catch {
        // Fallback: simple string conversion
        output += ` ${String(metadata)}`
      }
    }

    return output
  }
}
