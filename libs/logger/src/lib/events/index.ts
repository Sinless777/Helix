import { EventEmitter } from 'events'
import { calculateBackoff, BackoffOptions } from '../utils/backoff'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Central event bus for driver error and routing fallback events.
 */
const eventBus = new EventEmitter()

/**
 * Handler type for driver errors.
 */
export type DriverErrorHandler = (driverName: string, error: Error) => void

/**
 * Subscribe to driver error events.
 */
export function onDriverError(handler: DriverErrorHandler): void {
  eventBus.on('driverError', handler)
}

/**
 * Emit a driver error: logs immediately and notifies subscribers.
 */
export function emitDriverError(
  driverName: string,
  error: Error
): void {
  // Emit to console immediately
  console.error(`[driver.error] [${driverName}]`, error)
  eventBus.emit('driverError', driverName, error)
}

/**
 * Handler type for route fallback notifications.
 */
export type RouteFallbackHandler = (
  driverName: string,
  recordLocation: string
) => void

/**
 * Subscribe to route fallback events.
 */
export function onRouteFallback(handler: RouteFallbackHandler): void {
  eventBus.on('routeFallback', handler)
}

/**
 * Emit a fallback notification when primary routing fails over.
 */
export function emitRouteFallback(
  driverName: string,
  recordLocation: string
): void {
  eventBus.emit('routeFallback', driverName, recordLocation)
}

/**
 * Wraps an async operation with automatic retries and backoff on failure.
 * On final failure, emits a driverError event.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  driverName: string,
  options: {
    retries?: number
    backoffOpts?: BackoffOptions
  } = {}
): Promise<T> {
  const { retries = 3, backoffOpts } = options
  let attempt = 0
  while (true) {
    try {
      return await fn()
    } catch (error) {
      attempt++
      if (attempt > retries) {
        // Emit error after exhausting retries
        emitDriverError(driverName, error instanceof Error ? error : new Error(String(error)))
        throw error
      }
      const delay = calculateBackoff(attempt, backoffOpts)
      await new Promise((r) => setTimeout(r, delay))
    }
  }
}

export default eventBus
