// libs/logger/src/types/RouteRule.ts

/**
 * @packageDocumentation
 * @module RouteRule
 *
 * Defines the schema for dynamic routing rules, determining
 * how log records are dispatched to registered drivers.
 */

import type { LogLevel } from './LogRecord'

/**
 * Represents a single routing rule in the logger configuration.
 *
 * @remarks
 * Rules are evaluated in order, and the first matching rule
 * (glob pattern + level) directs the log to its configured drivers.
 *
 * @public
 */
export interface RouteRule {
  /**
   * Unique identifier for this rule.
   * Typically a UUID generated at creation time.
   */
  id: string

  /**
   * Whether this rule is currently active.
   * Disabled rules are ignored during matching.
   */
  enabled: boolean

  /**
   * Human-readable description explaining the rule's intent.
   */
  description: string

  /**
   * Glob-style pattern for matching the log's category.
   * @example
   * `"transactions.*"` will match `"transactions.create"` and `"transactions.update"`.
   * @defaultValue `undefined` (matches all categories)
   */
  pattern?: string

  /**
   * List of log levels this rule applies to.
   * @example
   * `['error', 'warn']` will only match error and warning logs.
   * @defaultValue `undefined` (applies to all levels)
   */
  levels?: LogLevel[]

  /**
   * List of driver names to which matching logs should be routed.
   * Drivers must be registered via `registerDriver`.
   * @example
   * `['file', 'elasticsearch']`
   */
  drivers: string[]
}
