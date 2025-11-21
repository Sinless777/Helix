import type { LoggerService as NestLoggerService } from '@nestjs/common';
import type { LoggerService as HelixLogger } from '@helix-ai/logger';

const buildMeta = (context?: string, extra?: Record<string, unknown>) => {
  if (!context && !extra) {
    return undefined;
  }
  return {
    ...(context ? { context } : {}),
    ...(extra ?? {}),
  };
};

export class HelixNestLogger implements NestLoggerService {
  constructor(private readonly logger: HelixLogger) {}

  log(message: unknown, context?: string) {
    this.logger.info(String(message), buildMeta(context));
  }

  error(message: unknown, trace?: string, context?: string) {
    this.logger.error(String(message), buildMeta(context, trace ? { trace } : undefined));
  }

  warn(message: unknown, context?: string) {
    this.logger.warn(String(message), buildMeta(context));
  }

  debug(message: unknown, context?: string) {
    this.logger.debug(String(message), buildMeta(context));
  }

  verbose(message: unknown, context?: string) {
    this.logger.trace(String(message), buildMeta(context));
  }
}
