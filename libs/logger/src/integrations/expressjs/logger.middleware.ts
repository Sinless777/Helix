// libs/logger/src/integrations/expressjs/logger.middleware.ts

import type { Request, Response, NextFunction } from 'express'
import { logger } from '../../lib/Logger'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Express middleware to log incoming HTTP requests and outgoing responses.
 *
 * @remarks
 * - Captures request method, URL, headers, query parameters, route params, and user ID (if available).
 * - On response finish, logs status code and request duration.
 * - Emits two separate log records: one at request start and one at response end.
 *
 * @example
 * ```ts
 * import express from 'express'
 * import { loggerMiddleware } from '@helix/logger/integrations/expressjs/logger.middleware'
 *
 * const app = express()
 * app.use(loggerMiddleware)
 * ```
 *
 * @param req - The incoming Express Request object
 * @param res - The Express Response object
 * @param next - Next middleware function in the chain
 *
 * @public
 */
export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Record start time for calculating duration
  const startTime = Date.now()

  /**
   * Initial log record for the incoming request.
   */
  const reqRecord: LogRecord = {
    /** ISO timestamp when the request was received */
    timestamp: new Date().toISOString(),
    /** Severity level for request start */
    level: 'info',
    /** Human-readable message */
    message: 'HTTP request received',
    /** Context: HTTP method and URL */
    context: `${req.method} ${req.originalUrl}`,
    /** Structured metadata with request details */
    metadata: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      query: req.query,
      params: req.params,
      /** Extracted user ID if authentication middleware set it */
      userId: (req as any).user?.id ?? null,
      host: req.hostname,
      pid: process.pid,
      /** Current runtime environment, defaulting to 'development' */
      environment: process.env['NODE_ENV'] ?? 'development',
    },
    /** Service name for grouping logs */
    service: process.env['SERVICE_NAME'] ?? 'unknown-service',
  }

  // Dispatch the request log asynchronously
  void logger.log(reqRecord)

  // Listen for response completion to log response details
  res.on('finish', () => {
    const durationMs = Date.now() - startTime

    /**
    /**
     * Log record for the completed response.
     */
    const resRecord: LogRecord = {
      timestamp: new Date().toISOString(),
      /** Level 'error' for 5xx, otherwise 'info' */
      level: res.statusCode >= 500 ? 'error' : 'info',
      /** Message indicating response status */
      message: `HTTP response ${res.statusCode}`,
      /** Context: same method and URL as request */
      context: `${req.method} ${req.originalUrl}`,
      /** Metadata including status code and timing */
      metadata: {
        statusCode: res.statusCode,
        durationMs,
        userId: (req as any).user?.id ?? null,
        pid: process.pid,
        environment: process.env['NODE_ENV'] ?? 'development',
      },
      /** Same service name as request log */
      service: process.env['SERVICE_NAME'] ?? 'unknown-service',
    }

    // Dispatch the response log asynchronously
    void logger.log(resRecord)
  })

  // Continue to next middleware or route handler
  next()
}
