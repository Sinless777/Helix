/**
 * Logger bootstrap helpers – keep types simple to avoid pulling logger/runtime deps.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerConfig {
  level: LogLevel;
  serviceName: string;
}

export const defaultLoggerConfig: LoggerConfig = {
  level: (process.env.LOG_LEVEL as LogLevel) ?? 'info',
  serviceName: process.env.SERVICE_NAME ?? 'helix',
};
