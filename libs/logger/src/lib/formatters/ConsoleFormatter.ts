import chalk from 'chalk';
import type { Formatter } from '../../types/Formatter';
import type { LogRecord, LogLevel } from '../../types/LogRecord';

// Map log levels to chalk color functions
const levelColor: Record<LogLevel, typeof chalk> = {
  fatal: chalk.redBright,
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.green,
  debug: chalk.blue,
  trace: chalk.magenta,
  success: chalk.cyan,
};

/**
 * Formatter that outputs colored, human-readable log messages to console.
 */
export class ConsoleFormatter implements Formatter {
  format(record: LogRecord): string {
    const { timestamp, level, message, context, metadata } = record;

    // Colorize level label
    const coloredLevel = levelColor[level](`[${level.toUpperCase()}]`);

    // Timestamp
    const ts = chalk.gray(timestamp);

    // Main log line
    let output = `${ts} ${coloredLevel} ${message}`;

    // Optional context
    if (context) {
      output += ` ${chalk.italic.dim(`(${context})`)}`;
    }

    // Metadata: display as JSON for extra fields
    if (metadata) {
      try {
        // Exclude standard fields if desired; here we show all
        const metaStr = JSON.stringify(metadata, null, 2);
        output += ` ${chalk.gray(metaStr)}`;
      } catch {
        // Fallback if metadata cannot be stringified
        output += ` ${chalk.gray(String(metadata))}`;
      }
    }

    return output;
  }
}
