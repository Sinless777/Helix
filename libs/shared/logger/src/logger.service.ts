// libs/shared/logger/src/logger.service.ts

import type { LoggerConfig, LogLevel, LogRecord, ILogger } from '@helix-ai/types';
import { DEFAULT_LOGGER_CONFIG } from './config';
import { LevelSeverity } from './level';
import { ConsoleTransport } from './transports/console.transport';
import { LokiTransport } from './transports/loki.transport';

export class LoggerService implements ILogger {
  private config: LoggerConfig;
  private consoleTransport?: ConsoleTransport;
  private lokiTransport?: LokiTransport;

  constructor(userConfig: LoggerConfig) {
    this.config = {
      ...DEFAULT_LOGGER_CONFIG,
      ...userConfig,
    };

    if (this.config.enableConsole) {
      this.consoleTransport = new ConsoleTransport(this.config);
    }

    if (this.config.lokiEndpoint) {
      this.lokiTransport = new LokiTransport(this.config);
    }
  }

  public getConfig(): LoggerConfig {
    return this.config;
  }

  private shouldLog(level: LogLevel): boolean {
    const minLevel = this.config.minLevel ?? DEFAULT_LOGGER_CONFIG.minLevel;
    return LevelSeverity[level] >= LevelSeverity[minLevel];
  }

  private buildRecord(level: LogLevel, message: string, meta?: Record<string, unknown>): LogRecord {
    return {
      timestamp: new Date().toISOString(),
      level,
      serviceName: this.config.serviceName,
      environment: this.config.environment,
      labels: this.config.defaultLabels ?? {},
      message,
      meta,
    };
  }

  private dispatch(record: LogRecord): void {
    if (this.consoleTransport) {
      this.consoleTransport.log(record);
    }
    if (this.lokiTransport) {
      // async fire-and-forget (could await if needed)
      this.lokiTransport.log(record).catch(err => {
        // in case Loki fails, fallback to console
        console.error('Error sending log to Loki:', err);
      });
    }
  }

  trace(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('trace')) return;
    const rec = this.buildRecord('trace', message, meta);
    this.dispatch(rec);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return;
    const rec = this.buildRecord('debug', message, meta);
    this.dispatch(rec);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;
    const rec = this.buildRecord('info', message, meta);
    this.dispatch(rec);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return;
    const rec = this.buildRecord('warn', message, meta);
    this.dispatch(rec);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return;
    const rec = this.buildRecord('error', message, meta);
    this.dispatch(rec);
  }

  fatal(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('fatal')) return;
    const rec = this.buildRecord('fatal', message, meta);
    this.dispatch(rec);
  }

  audit(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('audit')) return;
    const rec = this.buildRecord('audit', message, meta);
    this.dispatch(rec);
  }

  log(message: string, meta?: Record<string, unknown>): void {
    this.info(message, meta);
  }

  async flush(): Promise<void> {
    if (this.lokiTransport) {
      await this.lokiTransport.flush();
    }
  }
}
