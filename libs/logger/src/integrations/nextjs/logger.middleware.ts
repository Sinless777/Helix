// libs/logger/src/integrations/nextjs/logger.middleware.ts

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '../../lib/Logger'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Next.js Edge Middleware for request/response logging.
 *
 * @remarks
 * - Intended to be used in `middleware.ts`:
 *   ```ts
 *   export { loggerMiddleware as middleware } from '@helix/logger/integrations/nextjs/logger.middleware'
 *   ```
 * - Logs incoming HTTP request details immediately.
 * - After obtaining the response, logs status code and latency.
 * - Suitable for Next.js Edge or Middleware-enabled environments.
 *
 * @param req - The Next.js `NextRequest` object containing request data.
 * @returns A `NextResponse` to continue middleware chain.
 *
 * @category Middleware
 * @public
 */
export async function loggerMiddleware(
  req: NextRequest,
): Promise<NextResponse> {
  // Capture the start time to compute request duration
  const startTime = Date.now()
  const { method, url, headers, nextUrl } = req

  /**
   * Log record for the incoming request.
   * @type {LogRecord}
   */
  const requestRecord: LogRecord = {
    /** ISO timestamp when the request arrived */
    timestamp: new Date().toISOString(),
    /** Severity level for request receipt */
    level: 'info',
    /** Descriptive message for the request */
    message: 'Next.js request received',
    /** Context combines HTTP method and path */
    context: `${method} ${nextUrl.pathname}`,
    /** Structured metadata capturing request details */
    metadata: {
      method,
      url,
      headers: (() => {
        const map: Record<string, string> = {}
        headers.forEach((value, key) => {
          map[key] = value
        })
        return map
      })(),
      /** User-Agent header if present */
      userAgent: headers.get('user-agent') ?? undefined,
      /** Process identifier for tracing */
      pid: process.pid,
      /** Execution environment label */
      environment: process.env['NODE_ENV'] ?? 'development',
    },
    /** Identifies the service name in logs */
    service: process.env['SERVICE_NAME'] ?? 'unknown-service',
  }

  // Dispatch the request log (fire-and-forget)
  void logger.log(requestRecord)

  // Proceed to next middleware or route handler
  const response = NextResponse.next()

  // After response is generated, compute latency and log
  const latencyMs = Date.now() - startTime

  /**
   * Log record for the outgoing response.
   * @type {LogRecord}
   */
  const responseRecord: LogRecord = {
    /** ISO timestamp when the response is sent */
    timestamp: new Date().toISOString(),
    /** Severity level: error for 5xx, info otherwise */
    level: response.status >= 500 ? 'error' : 'info',
    /** Descriptive message for the response */
    message: `Next.js response ${response.status}`,
    /** Context repeats HTTP method and path */
    context: `${method} ${nextUrl.pathname}`,
    /** Metadata capturing response details */
    metadata: {
      statusCode: response.status,
      latencyMs,
      pid: process.pid,
      environment: process.env['NODE_ENV'] ?? 'development',
    },
    /** Service name matching the request log */
    service: process.env['SERVICE_NAME'] ?? 'unknown-service',
  }

  // Dispatch the response log asynchronously
  void logger.log(responseRecord)

  return response
}
