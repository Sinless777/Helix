import { createLogger, format, transports, Logger } from "winston";
import { WinstonModule } from "nest-winston";
import * as expressWinston from "express-winston";
import type { RequestHandler, ErrorRequestHandler } from "express";
import TransportStream from "winston-transport";
import { WinstonInstrumentation } from "@opentelemetry/instrumentation-winston";
import { ElasticsearchTransport } from "winston-elasticsearch";
import LokiTransport from "winston-loki";
import annotate from "winston-annotate";

/**
 * The shape of a single log event as it’s passed to drivers.
 */
export interface LogRecord {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  component?: string;
  labels?: Record<string, string>;
  metadata?: Record<string, unknown>;
  host?: string;
  pid?: number;
  gitCommit?: string;
  environment?: string;
  traceId?: string;
  [k: string]: unknown;
}

export interface ILoggerDriver {
  configure(logger: Logger): void;
}

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
export type LogFormat = "json" | "console";

export interface ILoggerConfig {
  level?: LogLevel;
  format?: LogFormat;
  transports?: TransportStream[];
  elasticsearch?: {
    host: string;
    index: string;
    username?: string;
    password?: string;
  };
  loki?: {
    host: string;
    labels?: string;
    username?: string;
    password?: string;
  };
  retention?: number;
  maxSize?: number;
  maxFiles?: number;
}

const defaultConfig: ILoggerConfig = {
  level: "info",
  format: "json",
  transports: [],
  retention: 30,
  maxSize: 5,
  maxFiles: 5,
};

export class HelixLogger {
  private readonly logger: Logger;

  constructor(
    private name: string,
    config: ILoggerConfig = {},
  ) {
    const cfg = { ...defaultConfig, ...config };

    const formats = [format.timestamp(), format.errors({ stack: true })];
    if (cfg.format === "json") {
      formats.push(format.json());
    } else {
      formats.push(format.colorize(), format.simple());
    }
    const logFormat = format.combine(...formats);

    const allTransports: TransportStream[] = [
      ...(cfg.transports || []),
      new transports.Console(),
    ];

    if (cfg.elasticsearch) {
      allTransports.push(
        new ElasticsearchTransport({
          level: cfg.level,
          clientOpts: {
            node: cfg.elasticsearch.host,
            auth:
              cfg.elasticsearch.username && cfg.elasticsearch.password
                ? {
                    username: cfg.elasticsearch.username,
                    password: cfg.elasticsearch.password,
                  }
                : undefined,
          },
          index: cfg.elasticsearch.index,
        }),
      );
    }

    if (cfg.loki) {
      allTransports.push(
        new LokiTransport({
          level: cfg.level,
          host: cfg.loki.host,
          basicAuth:
            cfg.loki.username && cfg.loki.password
              ? `${cfg.loki.username}:${cfg.loki.password}`
              : undefined,
          labels: cfg.loki.labels,
        }),
      );
    }

    this.logger = createLogger({
      level: cfg.level,
      format: logFormat,
      defaultMeta: { service: name },
      transports: allTransports,
    });

    // Auto-instrument Winston for OpenTelemetry
    new WinstonInstrumentation();

    // Annotate logs with the service name
    annotate(this.logger, { prefix: `${name}:` });
  }

  /**
   * Logs a message at the specified level with optional metadata.
   */
  public log(
    namespace: string,
    level: LogLevel,
    message: string,
    meta: Record<string, unknown> = {},
  ): void {
    this.logger.log(level, message, { namespace, ...meta });
  }

  public info(
    namespace: string,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    this.log(namespace, "info", message, meta);
  }

  public debug(
    namespace: string,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    this.log(namespace, "debug", message, meta);
  }

  public warn(
    namespace: string,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    this.log(namespace, "warn", message, meta);
  }

  public error(
    namespace: string,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    this.log(namespace, "error", message, meta);
  }

  public fatal(
    namespace: string,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    this.log(namespace, "fatal", message, meta);
  }

  /**
   * Returns the raw Winston logger instance.
   */
  public getLogger(): Logger {
    return this.logger;
  }

  /**
   * Provides a NestJS module for global logging
   */
  public static getModule(
    config: ILoggerConfig = {},
  ): ReturnType<typeof WinstonModule.forRoot> {
    return WinstonModule.forRoot({
      level: config.level ?? defaultConfig.level,
      transports: [new transports.Console()],
    });
  }

  /**
   * Express middleware for request logging
   */
  public static expressLogger(
    options: Partial<expressWinston.LoggerOptions> = {},
  ): RequestHandler {
    return expressWinston.logger({
      winstonInstance: createLogger({ transports: [new transports.Console()] }),
      ...options,
    });
  }

  /**
   * Express middleware for error logging
   */
  public static expressErrorLogger(
    options: Partial<expressWinston.ErrorLoggerOptions> = {},
  ): ErrorRequestHandler {
    return expressWinston.errorLogger({
      winstonInstance: createLogger({ transports: [new transports.Console()] }),
      ...options,
    });
  }
}
