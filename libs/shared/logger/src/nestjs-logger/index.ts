import { Logger } from '@nestjs/common';
import type { LoggerService as NestLoggerService } from '@nestjs/common';
import { createLogger } from '../logger.factory';
import type { LoggerConfig } from '@helix-ai/types';

/**
 * NestJS-compatible logger wrapper around the shared logger.service.
 */
export const createNestLogger = (config: LoggerConfig): NestLoggerService => {
  const base = createLogger(config);
  return new (class extends Logger implements NestLoggerService {
    override log(message: any, ...optionalParams: any[]) {
      base.info(String(message), optionalParams[0]);
    }
    override error(message: any, ...optionalParams: any[]) {
      base.error(String(message), optionalParams[0]);
    }
    override warn(message: any, ...optionalParams: any[]) {
      base.warn(String(message), optionalParams[0]);
    }
    override debug(message: any, ...optionalParams: any[]) {
      base.debug(String(message), optionalParams[0]);
    }
    override verbose(message: any, ...optionalParams: any[]) {
      base.debug(String(message), optionalParams[0]);
    }
  })();
};
