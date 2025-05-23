/**
 * Core metadata attached to every log record.
 * Includes standard fields and allows arbitrary extra keys.
 */
export interface LogMetadata {
  traceId?: string;
  spanId?: string;
  userId?: string;
  version?: string;
  host?: string;
  pid?: number;
  env?: string;
  otelSpan?: string;
  [key: string]: any;
}

/**
 * Supported log levels.
 */
export type LogLevel =
  | 'info'
  | 'warn'
  | 'error'
  | 'debug'
  | 'trace'
  | 'fatal'
  | 'success';

/**
 * A single log entry, with timestamp, level, message,
 * optional context, and structured metadata.
 */
export interface LogRecord {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  context?: string;
  metadata?: LogMetadata;
}
