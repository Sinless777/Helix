import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '../../lib/Logger'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Next.js Edge Middleware to log incoming requests and responses.
 * Use in your `middleware.ts`:
 * `export { loggerMiddleware as middleware } from '@helix/logger/integrations/nextjs/logger.middleware'`
 */
export async function loggerMiddleware(req: NextRequest) {
  const start = Date.now()
  const { method, url, headers, nextUrl } = req

  // Log the request
  const requestRecord: LogRecord = {
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Next.js request',
    context: `${method} ${nextUrl.pathname}`,
    metadata: {
      method,
      url,
      headers: (() => {
        const headerObj: Record<string, string> = {}
        headers.forEach((value, key) => {
          headerObj[key] = value
        })
        return headerObj
      })(),
      userAgent: headers.get('user-agent'),
      pid: process.pid,
      environment: process.env['NODE_ENV'] || 'development',
    },
    service: process.env['SERVICE_NAME'] || 'unknown-service',
  }
  void logger.log(requestRecord)

  // Continue to next
  const res = NextResponse.next()

  // After response, log status and latency
  const duration = Date.now() - start
  const responseRecord: LogRecord = {
    timestamp: new Date().toISOString(),
    level: res.status >= 500 ? 'error' : 'info',
    service: process.env['SERVICE_NAME'] || 'unknown-service',
    message: `Next.js response ${res.status}`,
    context: `${method} ${nextUrl.pathname}`,
    metadata: {
      status: res.status,
      duration,
      pid: process.pid,
      environment: process.env['NODE_ENV'] || 'development',
    },
  }
  void logger.log(responseRecord)

  return res
}
