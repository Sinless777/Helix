import type { Formatter } from '../../types/Formatter';
import type { LogRecord } from '../../types/LogRecord';

/**
 * Formatter that outputs human-readable log messages for file storage.
 */
export class FileFormatter implements Formatter {
  format(record: LogRecord): string {
    const { timestamp, level, message, context, metadata } = record;

    // Basic log line with timestamp and level
    let output = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    // Optional context information
    if (context) {
      output += ` (${context})`;
    }

    // Include metadata as compact JSON if present
    if (metadata) {
      try {
        // Serialize metadata without pretty-printing
        const metaStr = JSON.stringify(metadata);
        output += ` ${metaStr}`;
      } catch {
        output += ` ${String(metadata)}`;
      }
    }

    return output;
  }
}
