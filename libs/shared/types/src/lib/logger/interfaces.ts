import type { LoggerConfig } from './config';
import type { LogLevel } from './level';

export interface LogMeta {
  [key: string]: unknown;
}

export interface LogRecord {
  timestamp: string;
  level: LogLevel;
  serviceName: string;
  environment: string;
  labels: Record<string, string>;
  message: string;
  meta?: LogMeta;
}

export interface ILogger {
  trace(message: string, meta?: LogMeta): void;
  debug(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, meta?: LogMeta): void;
  fatal(message: string, meta?: LogMeta): void;
  audit(message: string, meta?: LogMeta): void;
  getConfig(): LoggerConfig;
  flush?(): Promise<void>;
  log?(message: string, meta?: LogMeta): void;
}
