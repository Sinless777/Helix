// libs/core/src/lib/types/system.ts

/* -----------------------------------------------------------------------------
 * System Types
 * Centralized enums and type definitions used across Helix AI's core libraries.
 * ---------------------------------------------------------------------------*/

/**
 * Common system environments
 */
export type Environment = 'development' | 'staging' | 'production' | 'test'

/**
 * Supported log levels across system components
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

/**
 * ANSI-compatible color definitions with hex + rgb fallback.
 * Typically mirrored in constants/frontend/system for UI display.
 */
export interface ColorCode {
  ansi: string
  hex: `#${string}`
  rgb: `rgb(${number}, ${number}, ${number})`
  rgba: `rgba(${number}, ${number}, ${number}, ${number})`
}

export interface SystemColors {
  reset: string
  bright: string
  dim: string
  underscore: string
  blink: string
  reverse: string
  hidden: string
  fg: Record<string, ColorCode>
  bg: Record<string, ColorCode>
}

/**
 * Strict system status codes, e.g. for health checks or component availability
 */
export type SystemStatus =
  | 'healthy'
  | 'degraded'
  | 'down'
  | 'maintenance'
  | 'unknown'

/**
 * Unique identifiers for subsystems.
 * Extendable union if you add more top-level services.
 */
export type Subsystem =
  | 'api'
  | 'database'
  | 'gateway'
  | 'dashboard'
  | 'discord'
  | 'cloudflare'
  | 'worker'
  | 'cache'
  | 'queue'

/**
 * System metadata for runtime reporting (like `/status` or `/healthz` endpoints).
 */
export interface SystemInfo {
  /** Subsystem name */
  name: Subsystem
  /** Current operational status */
  status: SystemStatus
  /** Version string (semantic or git hash) */
  version?: string
  /** Optional last update timestamp (ISO 8601) */
  updatedAt?: string
  /** Arbitrary metadata, e.g., region, cluster, etc. */
  meta?: Record<string, unknown>
}

/**
 * Wrapper for a collection of subsystem reports
 */
export interface SystemReport {
  environment: Environment
  generatedAt: string // ISO 8601 timestamp
  services: SystemInfo[]
}

/**
 * Guard function signatures
 */
export type Guard<T> = (value: unknown) => value is T
