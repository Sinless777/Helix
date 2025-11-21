import { createLogger } from '../logger.factory';
import type { LoggerConfig } from '@helix-ai/types';

export const nextLogger = (config: LoggerConfig) => {
  const base = createLogger(config);
  return {
    log: (message: string, meta?: Record<string, unknown>) => base.info(message, meta),
    info: (message: string, meta?: Record<string, unknown>) => base.info(message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => base.warn(message, meta),
    error: (message: string, meta?: Record<string, unknown>) => base.error(message, meta),
    debug: (message: string, meta?: Record<string, unknown>) => base.debug(message, meta),
  };
};
