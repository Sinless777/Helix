/**
 * Defines a routing rule for logger records.
 * Determines which drivers receive a log based on category pattern and level.
 */
import type { LogLevel } from './LogRecord'

export interface RouteRule {
  /** Unique identifier for this rule */
  id: string

  /** Whether this rule is active */
  enabled: boolean

  /** Human-readable description of the rule's purpose */
  description: string

  /**
   * Glob pattern for category matching (e.g. "transactions.*").
   * If undefined, matches all categories.
   */
  pattern?: string

  /**
   * List of log levels this rule applies to (e.g. ['error','warn']).
   * If undefined, applies to all levels.
   */
  levels?: LogLevel[]

  /**
   * Names of target drivers (e.g. ['elasticsearch','file']).
   */
  drivers: string[]
}
