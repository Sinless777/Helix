import type { IncomingMessage, ServerResponse } from 'http'
import type { DriverBase } from '../../lib/DriverBase'
import type { RouteRule } from '../../types/RouteRule'

/**
 * Context interface for all tRPC procedure invocations within Helix Logger.
 * Encapsulates HTTP request/response objects and logger-specific internals,
 * enabling resolvers to access driver instances and routing rules.
 *
 * @interface Context
 */
export interface Context {
  /**
   * Raw HTTP request object from Node.js server.
   * Contains headers, URL, method, and other request metadata.
   *
   * @type {IncomingMessage}
   */
  req: IncomingMessage

  /**
   * Raw HTTP response object from Node.js server.
   * Allows mutation of status codes, headers, and response body.
   *
   * @type {ServerResponse}
   */
  res: ServerResponse

  /**
   * Map of all registered logger driver instances, keyed by unique name.
   * Drivers implement the lifecycle and log-handling interface.
   *
   * @type {Record<string, DriverBase>}
   */
  drivers: Record<string, DriverBase>

  /**
   * Current in-memory list of routing rules determining driver targets
   * based on log record category patterns and levels.
   *
   * @type {RouteRule[]}
   */
  rules: RouteRule[]
}

/**
 * Factory to construct a tRPC execution context per incoming request.
 * Merges raw HTTP objects with Helix Logger internals for handlers.
 *
 * @async
 * @function createContext
 * @param {Object} opts - Options for building the context
 * @param {IncomingMessage} opts.req - The Node.js HTTP request
 * @param {ServerResponse} opts.res - The Node.js HTTP response
 * @param {Record<string, DriverBase>} opts.drivers - Registered driver map
 * @param {RouteRule[]} opts.rules - Routing rules array
 * @returns {Promise<Context>} Resolves to a fully-populated Context object
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
