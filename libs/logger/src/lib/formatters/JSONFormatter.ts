// libs/logger/src/lib/formatters/JSONFormatter.ts

import type { Formatter } from '../../types/Formatter'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Formatter that outputs a fully structured JSON string for log records.
 *
 * Serializes the entire LogRecord, preserving timestamp, level, service,
 * message, context, and metadata. Falls back to safe partial serialization
 * if the full record cannot be stringified.
 *
 * @public
 * @class
 * @implements {Formatter}
 */
export class JSONFormatter implements Formatter {
  /**
   * Convert a LogRecord into a JSON string.
   *
   * Attempts to directly stringify the full record for maximum fidelity.
   * On error (e.g., circular references), falls back to a safe subset.
   *
   * @param record - The structured log record to format.
   * @returns The JSON string representation of the record.
   *
   * @example
   * ```ts
   * const formatter = new JSONFormatter()
   * const json = formatter.format({
   *   timestamp: new Date().toISOString(),
   *   level: 'info',
   *   service: 'auth',
   *   message: 'User login',
   *   context: 'AuthController.login',
   *   metadata: { userId: 'u123', ip: '127.0.0.1' }
   * })
   * // '{"timestamp":"2025-05-24T12:00:00.000Z","level":"info","service":"auth",...}'
   * ```
   */
  public format(record: LogRecord): string {
    try {
      // Primary: serialize entire record
      return JSON.stringify(record)
    } catch (err) {
      // Fallback: serialize core fields only
      const safeRecord = {
        timestamp: record.timestamp,
        level: record.level,
        service: record.service,
        message: record.message,
        context: record.context,
        metadata: record.metadata,
      }
      return JSON.stringify(safeRecord)
    }
  }
}
