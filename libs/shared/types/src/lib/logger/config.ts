import type { LogLevel } from './level';

export interface LoggerConfig {
  /** Unique name of the service or application (e.g., “user-service”) */
  serviceName: string;
  /** Execution environment (e.g., “development”, “staging”, “production”) */
  environment: string;
  /** Minimum log level to emit. Logs below this severity will be ignored. */
  minLevel?: LogLevel;
  /** URL endpoint for sending logs to Grafana Loki / Grafana Cloud push-API. */
  lokiEndpoint?: string;
  /** Optional authentication token or API key for Loki ingestion (if required). */
  lokiApiKey?: string;
  /** Default labels to attach to every log record (e.g., { app: “user-service”, region: “us-west” }) */
  defaultLabels?: Record<string, string>;
  /** If true, also output logs to console regardless of Loki forwarding. */
  enableConsole?: boolean;
  options?: {
    wrapMeta?: boolean;
    consoleJson?: boolean;
  };
}
