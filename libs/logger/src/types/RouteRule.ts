// libs/logger/src/types/RouteRule.ts

/**
 * @packageDocumentation
 *
 * Defines the schema for dynamic routing rules that determine
 * how `LogRecord`s are dispatched to registered drivers.
 */

/**
 * Represents a single routing rule in the logger configuration.
 *
 * @public
 * @remarks
 * Rules are evaluated in order; the first matching rule (by `pattern` and `levels`)
 * directs the log to its configured `drivers`.
 *
 * @param id - Unique identifier for the rule, typically a UUID.
 * @param enabled - Whether the rule is currently active.
 * @param description - Human-readable description of the rule's purpose.
 * @param pattern - Glob-style pattern for matching log categories.
 * @param levels - List of log levels to which this rule applies.
 * @param drivers - Names of the drivers to which matching logs should be routed.
 *
 * @example
 * ```typescript
 * const rule: RouteRule = {
 *  id: '123e4567-e89b-12d3-a456-426614174000',
 * enabled: true,
 * description: 'Route transaction logs to file and Elasticsearch',
 * pattern: 'transactions.*',
 * levels: ['error', 'warn'],
 * drivers: ['file', 'elasticsearch'],
 * }
 * ```
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
   * Human-readable description explaining the rule’s intent.
   */
  description: string

  /**
   * Glob-style pattern for matching the log’s category.
   *
   * @example
   * `"transactions.*"` will match `"transactions.create"` and `"transactions.update"`.
   * @defaultValue `undefined` (matches all categories)
   */
  pattern?: string

  /**
   * List of log levels to which this rule applies.
   *
   * @example
   * `['error', 'warn']` will only match error and warning logs.
   * @defaultValue `undefined` (applies to all levels)
   */
  levels?: import('./LogRecord').LogLevel[]

  /**
   * Names of the drivers to which matching logs should be routed.
   * These drivers must have been registered via `registerDriver`.
   *
   * @example
   * `['file', 'elasticsearch']`
   */
  drivers: string[]
}
