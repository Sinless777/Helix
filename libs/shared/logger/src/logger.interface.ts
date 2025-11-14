// libs/shared/logger/src/logger.interface.ts

import { LogLevel } from './level';
import { LoggerConfig } from './config';

export interface LogMeta {
  /** Arbitrary metadata/context to attach to the log record */
  [key: string]: unknown;
}

export interface LogRecord {
  /** ISO‐timestamp string when the log occurred */
  timestamp: string;
  /** Log level (trace, debug, info, warn, error, fatal, audit) */
  level: LogLevel;
  /** The service or application name this log is coming from */
  serviceName: string;
  /** Environment (e.g., development, staging, production) */
  environment: string;
  /** Default labels (from config) plus any record‐specific labels */
  labels: Record<string, string>;
  /** The main log message */
  message: string;
  /** Optional metadata/context object */
  meta?: LogMeta;
}

export interface ILogger {
  /**
   * Logs a record at level “trace”
   */
  trace(message: string, meta?: LogMeta): void;

  /**
   * Logs a record at level “debug”
   */
  debug(message: string, meta?: LogMeta): void;

  /**
   * Logs a record at level “info”
   */
  info(message: string, meta?: LogMeta): void;

  /**
   * Logs a record at level “warn”
   */
  warn(message: string, meta?: LogMeta): void;

  /**
   * Logs a record at level “error”
   */
  error(message: string, meta?: LogMeta): void;

  /**
   * Logs a record at level “fatal”
   */
  fatal(message: string, meta?: LogMeta): void;

  /**
   * Logs an audit‐level event; intended for important business events
   */
  audit(message: string, meta?: LogMeta): void;

  /**
   * Returns the configuration this logger was created with
   */
  getConfig(): LoggerConfig;

  /**
   * Optionally, flush all pending logs (useful for shutdown)
   */
  flush?(): Promise<void>;
}
