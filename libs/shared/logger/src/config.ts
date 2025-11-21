// libs/shared/logger/src/config.ts

import { LogLevel } from './level';

export interface LoggerConfig {
  /** Unique name of the service or application (e.g., “user-service”) */
  serviceName: string;

  /** Execution environment (e.g., “development”, “staging”, “production”) */
  environment: string;

  /** Minimum log level to emit. Logs below this severity will be ignored. */
  minLevel?: LogLevel;

  /**
   * URL endpoint for sending logs to Grafana Loki / Grafana Cloud push-API.
   * If omitted, logs may still go to console (local dev) but not forwarded to Loki.
   */
  lokiEndpoint?: string;

  /**
   * Optional authentication token or API key for Loki ingestion (if required).
   */
  lokiApiKey?: string;

  /** Default labels to attach to every log record (e.g., { app: “user-service”, region: “us-west” }) */
  defaultLabels?: Record<string, string>;

  /** If true, also output logs to console (with colours) regardless of Loki forwarding. */
  enableConsole?: boolean;

  /** Additional flags or behaviour toggles */
  options?: {
    /** If set, wrap metadata in a “meta” field instead of top-level */
    wrapMeta?: boolean;
    /** Format logs in JSON even in console (useful in production) */
    consoleJson?: boolean;
  };
}

export const DEFAULT_LOGGER_CONFIG: Required<Pick<LoggerConfig, 'minLevel' | 'enableConsole'>> = {
  minLevel: 'info',
  enableConsole: true,
};
