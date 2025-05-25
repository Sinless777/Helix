// libs/logger/src/types/Formatter.ts

/**
 * @packageDocumentation
 *
 * Defines the base interface for all log output formatters.
 */

import type { LogRecord } from './LogRecord'

/**
 * Formatter interface for converting a `LogRecord` into a string.
 * Drivers use implementations of this interface to render logs
 * in various formats (plain text, JSON, colored console output, etc.).
 *
 * @public
 */
export interface Formatter {
  /**
   * Format a log record into a string representation.
   *
   * @param record - The log record to format.
   * @returns A formatted string ready for output.
   */
  format(record: LogRecord): string
}
