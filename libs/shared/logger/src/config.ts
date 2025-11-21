// libs/shared/logger/src/config.ts

import type { LoggerConfig } from '@helix-ai/types';
export type { LoggerConfig } from '@helix-ai/types';

export const DEFAULT_LOGGER_CONFIG: Required<Pick<LoggerConfig, 'minLevel' | 'enableConsole'>> = {
  minLevel: 'info',
  enableConsole: true,
};
