/**
 * Formatter interface for converting LogRecord into formatted output.
 * Used by drivers to render logs in specific formats (text, JSON, colors, etc.).
 */
import type { LogRecord } from './LogRecord'

export interface Formatter {
  /**
   * Convert a LogRecord into a string for output.
   * @param record - the log record to format
   * @returns formatted string
   */
  format(record: LogRecord): string
}
