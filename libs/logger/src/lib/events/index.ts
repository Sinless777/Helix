// libs/logger/src/lib/events/index.ts

import { EventEmitter } from 'events'
import { calculateBackoff, BackoffOptions } from '../utils/backoff'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Central event bus for driver error and routing fallback events.
 *
 * @remarks
 * Uses Node.js EventEmitter under the hood to broadcast and listen for
 * driver error notifications and routing fallback events across the system.
 *
 * @public
 */
const eventBus = new EventEmitter()

/**
 * Signature for handlers receiving driver error notifications.
 *
 * @param driverName - The unique name of the driver that failed.
 * @param error - The Error object representing the failure cause.
 *
 * @public
 */
export type DriverErrorHandler = (driverName: string, error: Error) => void

/**
 * Subscribe to driver error events.
 *
 * @param handler - Callback invoked whenever a driver emits an error.
 *
 * @example
 * ```ts
 * onDriverError((name, err) => {
 *   console.log(`Driver ${name} failed:`, err)
 * })
 * ```
 *
 * @public
 */
export function onDriverError(handler: DriverErrorHandler): void {
  eventBus.on('driverError', handler)
}

/**
 * Emit a driver error event.
 *
 * Logs immediately to stderr and notifies all subscribers on the bus.
 *
 * @param driverName - The unique name of the driver.
 * @param error - The Error instance to emit.
 *
 * @public
 */
export function emitDriverError(driverName: string, error: Error): void {
  // Immediate console error output
  console.error(`[driver.error] [${driverName}]`, error)
  eventBus.emit('driverError', driverName, error)
}

/**
 * Signature for handlers receiving route fallback notifications.
 *
 * @param driverName - The name of the fallback driver.
 * @param recordLocation - The location or identifier of the log record.
 *
 * @public
 */
export type RouteFallbackHandler = (
  driverName: string,
  recordLocation: string,
) => void

/**
 * Subscribe to route fallback events.
 *
 * @param handler - Callback invoked whenever a routing fallback occurs.
 *
 * @example
 * ```ts
 * onRouteFallback((name, location) => {
 *   console.warn(`Fallback to ${name} for record at ${location}`)
 * })
 * ```
 *
 * @public
 */
export function onRouteFallback(handler: RouteFallbackHandler): void {
  eventBus.on('routeFallback', handler)
}

/**
 * Emit a routing fallback notification when primary routing fails over.
 *
 * @param driverName - The name of the fallback driver.
 * @param recordLocation - The location or identifier of the log record.
 *
 * @public
 */
export function emitRouteFallback(
  driverName: string,
  recordLocation: string,
): void {
  eventBus.emit('routeFallback', driverName, recordLocation)
}

/**
 * Wraps an asynchronous operation with automatic retries and exponential backoff.
 *
 * Retries up to `options.retries` times, waiting an increasing delay
 * (with optional jitter) between attempts. On final failure, emits a
 * `driverError` event and rethrows the error.
 *
 * @typeParam T - The return type of the wrapped function.
 * @param fn - The async function to execute with retry semantics.
 * @param driverName - Name of the driver, used for error emission.
 * @param options - Optional configuration:
 *   - `retries` (default: 3): number of retry attempts.
 *   - `backoffOpts`: customization for baseDelay, factor, maxDelay, jitter.
 * @returns The resolved value of `fn` if successful.
 * @throws The last encountered error after exhausting retries.
 *
 * @example
 * ```ts
 * await withRetry(
 *   () => myDriver.sendBatch(batch),
 *   'elasticsearch',
 *   { retries: 5, backoffOpts: { baseDelay: 200 } }
 * )
 * ```
 *
 * @public
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  driverName: string,
  options: {
    retries?: number
    backoffOpts?: BackoffOptions
  } = {},
): Promise<T> {
  const { retries = 3, backoffOpts } = options
  let attempt = 0

  while (true) {
    try {
      // Attempt the operation
      return await fn()
    } catch (err) {
      attempt += 1

      // If max attempts exceeded, emit error and rethrow
      if (attempt > retries) {
        const error = err instanceof Error ? err : new Error(String(err))
        emitDriverError(driverName, error)
        throw error
      }

      // Compute backoff delay and wait
      const delay = calculateBackoff(attempt, backoffOpts)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

/**
 * Default export of the internal event bus.
 *
 * @public
 */
export default eventBus
