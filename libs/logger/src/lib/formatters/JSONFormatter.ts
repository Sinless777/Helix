import type { Formatter } from '../../types/Formatter'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Formatter that outputs a structured JSON string for log records.
 */
export class JSONFormatter implements Formatter {
  format(record: LogRecord): string {
    // Directly stringify the record for structured logging
    try {
      return JSON.stringify(record)
    } catch (err) {
      // Fallback to partial serialization if error
      const safeRecord = {
        timestamp: record.timestamp,
        level: record.level,
        message: record.message,
        context: record.context,
        metadata: record.metadata,
      }
      return JSON.stringify(safeRecord)
    }
  }
}
