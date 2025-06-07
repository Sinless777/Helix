// libs/logger/src/integrations/nextjs/logger.middleware.ts

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '../../lib/Logger'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Next.js Edge Middleware for request and response logging.
 *
 * @remarks
 * - Use by exporting in your `middleware.ts`:
 * ```ts
 * export { loggerMiddleware as middleware } from '@helix/logger/integrations/nextjs/logger.middleware'
 * ```
 * - Logs incoming request details immediately, then response status and latency.
 *
 * @public
 */
export async function loggerMiddleware(
  /**
   * The incoming Next.js request object.
   */
  req: NextRequest,
): Promise<NextResponse> {
  // Capture start time for latency measurement
  const startTime = Date.now()
  const { method, url, headers, nextUrl } = req

  // Build and dispatch the request log
  const requestRecord: LogRecord = {
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Next.js request received',
    context: `${method} ${nextUrl.pathname}`,
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
      userAgent: headers.get('user-agent') ?? undefined,
      pid: process.pid,
      environment: process.env['NODE_ENV'] ?? 'development',
    },
    service: process.env['SERVICE_NAME'] ?? 'unknown-service',
  }
  void logger.log(requestRecord)

  // Continue to next handler
  const response = NextResponse.next()

  // After response, compute latency and dispatch response log
  const latencyMs = Date.now() - startTime
  const responseRecord: LogRecord = {
    timestamp: new Date().toISOString(),
    level: response.status >= 500 ? 'error' : 'info',
    message: `Next.js response ${response.status}`,
    context: `${method} ${nextUrl.pathname}`,
    metadata: {
      statusCode: response.status,
      latencyMs,
      pid: process.pid,
      environment: process.env['NODE_ENV'] ?? 'development',
    },
    service: process.env['SERVICE_NAME'] ?? 'unknown-service',
  }
  void logger.log(responseRecord)

  return response
}
