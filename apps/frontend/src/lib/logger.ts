import 'server-only';

import { LoggerService } from '@helix-ai/logger';
import type { LoggerConfig } from '@helix-ai/logger';
import type { LogLevel } from '@helix-ai/logger';

const LOG_LEVELS: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'audit'];

function parseLogLevel(value?: string | null): LogLevel {
  if (!value) return 'info';
  const normalised = value.toLowerCase() as LogLevel;
  return LOG_LEVELS.includes(normalised) ? normalised : 'info';
}

function parseBoolean(value?: string | null): boolean {
  if (value === undefined || value === null) return true;
  return !['false', '0', 'off'].includes(value.toLowerCase());
}

const serviceName = process.env.NEXT_PUBLIC_SERVICE_NAME || 'frontend';
const environment = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development';

const loggerConfig: LoggerConfig = {
  serviceName,
  environment,
  minLevel: parseLogLevel(process.env.NEXT_PUBLIC_LOG_LEVEL),
  lokiEndpoint: process.env.NEXT_PUBLIC_LOKI_ENDPOINT,
  lokiApiKey: process.env.NEXT_PUBLIC_LOKI_API_KEY,
  enableConsole: parseBoolean(process.env.NEXT_PUBLIC_LOG_CONSOLE),
  defaultLabels: {
    app: serviceName,
    region: process.env.NEXT_PUBLIC_REGION || process.env.VERCEL_REGION || 'unknown',
    commit: process.env.NEXT_PUBLIC_GIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  },
  options: {
    consoleJson: process.env.NEXT_PUBLIC_LOG_CONSOLE_JSON === 'true',
  },
};

export const frontendLogger = new LoggerService(loggerConfig);

export type FrontendLogger = LoggerService;
