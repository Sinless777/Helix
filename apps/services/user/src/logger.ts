import { LoggerService } from '@helix-ai/logger';
import type { LoggerConfig } from '@helix-ai/logger';
import type { LogLevel } from '@helix-ai/logger';

const LEVELS: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'audit'];

const parseLevel = (value?: string): LogLevel => {
  if (!value) return 'info';
  const normalised = value.toLowerCase() as LogLevel;
  return LEVELS.includes(normalised) ? normalised : 'info';
};

const parseBoolean = (value?: string): boolean => {
  if (!value) return true;
  return !['false', '0', 'off'].includes(value.toLowerCase());
};

const serviceName = process.env.LOGGER_SERVICE_NAME || 'user-service';
const environment = process.env.NODE_ENV || 'development';

const config: LoggerConfig = {
  serviceName,
  environment,
  minLevel: parseLevel(process.env.LOG_LEVEL),
  lokiEndpoint: process.env.LOKI_ENDPOINT,
  lokiApiKey: process.env.LOKI_API_KEY,
  enableConsole: parseBoolean(process.env.LOG_ENABLE_CONSOLE),
  defaultLabels: {
    app: serviceName,
    region: process.env.REGION || process.env.VERCEL_REGION || 'unknown',
  },
  options: {
    consoleJson: process.env.LOG_CONSOLE_JSON === 'true',
  },
};

export const helixLogger = new LoggerService(config);
