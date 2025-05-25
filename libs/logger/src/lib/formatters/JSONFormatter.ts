// libs/logger/src/lib/formatters/JSONFormatter.ts

import type { Formatter } from '../../types/Formatter'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Outputs a structured JSON string for a log record.
 *
 * Attempts to stringify the entire record for maximum fidelity; if that fails
 * (e.g. due to circular references), falls back to serializing core fields only.
 *
 * @example
 * ```ts
 * const fmt = new JSONFormatter()
 * console.log(fmt.format({
 *   timestamp: new Date().toISOString(),
 *   level: 'info',
 *   service: 'auth',
 *   message: 'User login',
 *   context: 'AuthController.login',
 *   metadata: { userId: 'u123', ip: '127.0.0.1' }
 * }))
 * // => '{"timestamp":"2025-05-24T12:00:00.000Z","level":"info","service":"auth",...}'
 * ```
 */
export class JSONFormatter implements Formatter {
  /**
   * Convert a LogRecord into its JSON string representation.
   *
   * @param record - The structured log record
   * @returns The JSON string
   */
  public format(record: LogRecord): string {
    try {
      return JSON.stringify(record)
    } catch {
      // Fallback: serialize only safe fields
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
