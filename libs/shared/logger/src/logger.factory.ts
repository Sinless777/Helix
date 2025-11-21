import { LoggerService } from './logger.service';
import type { LoggerConfig, ILogger } from '@helix-ai/types';

export const createLogger = (config: LoggerConfig): ILogger => new LoggerService(config);
