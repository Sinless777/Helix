// libs/logger/src/types/LogRecord.ts

/**
 * @packageDocumentation
 *
 * Defines the core types for structured log records and their metadata.
 */

/**
 * Core metadata attached to every log record.
 * Includes standard fields for tracing, user identification, host info,
 * and allows arbitrary extra keys for extensibility.
 *
 * @public
 * @remarks
 * Drivers may attach additional context-specific metadata via extra fields.
 */
export interface LogMetadata {
  /** OpenTelemetry trace identifier */
  traceId?: string
  /** OpenTelemetry span identifier */
  spanId?: string
  /** Identifier of the current user (if available) */
  userId?: string
  /** Application version emitting the log */
  version?: string
  /** Hostname or IP of the emitter */
  host?: string
  /** Process identifier (PID) */
  pid?: number
  /** Runtime environment (e.g., "production", "development") */
  env?: string
  /** Optional OTEL span context reference */
  otelSpan?: string
  /** Arbitrary extra fields for diagnosis */
  [key: string]: any
}

/**
 * Supported log levels, ordered by severity.
 *
 * @public
 */
export type LogLevel =
  | 'info'
  | 'warn'
  | 'error'
  | 'debug'
  | 'trace'
  | 'fatal'
  | 'success'

/**
 * A single log entry, containing timestamp, severity level,
 * message, optional context string, service identifier, and metadata.
 *
 * @public
 */
export interface LogRecord {
  /** ISO-8601 timestamp of when the log was created */
  timestamp: string
  /** Severity level of the log entry */
  level: LogLevel
  /** Name of the service or component emitting the log */
  service: string
  /** Human-readable log message */
  message: string
  /** Optional context or category string */
  context?: string
  /** Structured metadata for diagnostics and correlation */
  metadata?: LogMetadata
}
