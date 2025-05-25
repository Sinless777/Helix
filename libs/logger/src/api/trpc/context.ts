// libs/logger/src/api/trpc/context.ts

import type { IncomingMessage, ServerResponse } from 'http'
import type { DriverBase } from '../../lib/DriverBase'
import type { RouteRule } from '../../types/RouteRule'

/**
 * Execution context for all tRPC procedures within Helix Logger.
 *
 * Provides access to:
 * - the raw HTTP request and response,
 * - the registry of logger drivers,
 * - and the active routing rules.
 */
export interface Context {
  /**
   * The Node.js HTTP request object containing headers, URL, method, etc.
   */
  req: IncomingMessage

  /**
   * The Node.js HTTP response object, used to set status, headers, body, etc.
   */
  res: ServerResponse

  /**
   * Registered logger driver instances by name.
   */
  drivers: Record<string, DriverBase>

  /**
   * In-memory list of routing rules used to determine which drivers
   * receive each LogRecord.
   */
  rules: RouteRule[]
}

/**
 * Build a new tRPC {@link Context} for each incoming request.
 *
 * @param opts - Initialization options containing:
 *   - req: The incoming HTTP request
 *   - res: The outgoing HTTP response
 *   - drivers: Map of registered DriverBase instances
 *   - rules: Array of active RouteRule definitions
 * @returns A Promise that resolves to a populated Context
 */
export async function createContext(opts: {
  req: IncomingMessage
  res: ServerResponse
  drivers: Record<string, DriverBase>
  rules: RouteRule[]
}): Promise<Context> {
  const { req, res, drivers, rules } = opts
  return {
    req,
    res,
    drivers,
    rules,
  }
}
