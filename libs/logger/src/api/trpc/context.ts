import type { IncomingMessage, ServerResponse } from 'http'
import type { DriverBase } from '../../lib/DriverBase'
import type { RouteRule } from '../../types/RouteRule'

/**
 * Context interface for tRPC procedures.
 * Provides access to HTTP request/response and logger internals.
 */
export interface Context {
  /**
   * HTTP request object (Node.js).
   */
  req: IncomingMessage

  /**
   * HTTP response object (Node.js).
   */
  res: ServerResponse

  /**
   * Registered logger drivers.
   * Keyed by driver name.
   */
  drivers: Record<string, DriverBase>

  /**
   * Current routing rules loaded from config.
   */
  rules: RouteRule[]
}

/**
 * Create a new tRPC context for each request.
 * @param opts Request context options.
 * @returns Context object for resolvers.
 */
export async function createContext(opts: {
  req: IncomingMessage
  res: ServerResponse
  drivers: Record<string, DriverBase>
  rules: RouteRule[]
}): Promise<Context> {
  const { req, res, drivers, rules } = opts
  return { req, res, drivers, rules }
}
