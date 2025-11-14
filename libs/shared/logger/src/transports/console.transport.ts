// libs/shared/logger/src/transports/console.transport.ts
import { LogLevel, LevelColor, RESET_COLOR } from '../level';
import { LogRecord } from '../logger.interface';
import { LoggerConfig } from '../config';

export class ConsoleTransport {
  constructor(private readonly config: LoggerConfig) {}

  /**
   * Checks if the record should be logged (based on minLevel in config).
   */
  private shouldLog(level: LogLevel): boolean {
    const threshold = this.config.minLevel ?? 'info';
    const allLevels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'audit'];
    const thresholdIndex = allLevels.indexOf(threshold);
    const levelIndex     = allLevels.indexOf(level);
    return levelIndex >= thresholdIndex;
  }

  /**
   * Format a log record as a coloured string or JSON (based on config).
   */
  private format(record: LogRecord): string {
    const { environment, serviceName, level, timestamp, labels, message, meta } = record;
    const labelString = Object.entries(labels)
      .map(([k, v]) => `${k}=${v}`)
      .join(' ');
    if (this.config.options?.consoleJson) {
      return JSON.stringify({ timestamp, serviceName, environment, level, labels, message, meta });
    } else {
      const color  = LevelColor[level] ?? '';
      const reset  = RESET_COLOR;
      const prefix = `${timestamp} [${serviceName}] (${environment}) ${level.toUpperCase()}:`;
      const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
      return `${color}${prefix}${reset} ${message} ${labelString}${metaStr}`;
    }
  }

  /**
   * Log the record to the console.
   */
  public log(record: LogRecord): void {
    if (!this.config.enableConsole) {
      return;
    }
    if (!this.shouldLog(record.level)) {
      return;
    }

    const formatted = this.format(record);

    switch (record.level) {
      case 'trace':
      case 'debug':
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
      case 'fatal':
        console.error(formatted);
        break;
      case 'audit':
        console.log(formatted);
        break;
      default:
        console.log(formatted);
        break;
    }
  }
}
