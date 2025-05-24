import type { Request, Response, NextFunction } from 'express'
import { logger } from '../../lib/Logger'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Express middleware to log HTTP requests and responses.
 * Injects method, URL and relevant request metadata into the logger.
 * @param req Express request object
 * @param res Express response object
 * @param next Next middleware function
 */
export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const startTime = Date.now()
  // Build initial log record
  const record: LogRecord = {
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'HTTP request',
    context: `${req.method} ${req.originalUrl}`,
    metadata: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      query: req.query,
      params: req.params,
      userId: (req as any).user?.id ?? null,
      host: req.hostname,
      pid: process.pid,
      environment: process.env['NODE_ENV'] ?? 'development',
    },
    service: process.env['SERVICE_NAME'] ?? 'unknown-service',
  }

  // Log the incoming request
  void logger.log(record)

  // After response is finished, log response time and status
  res.on('finish', () => {
    const durationMs = Date.now() - startTime
    const resRecord: LogRecord = {
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 500 ? 'error' : 'info',
      message: `HTTP response ${res.statusCode}`,
      context: `${req.method} ${req.originalUrl}`,
      metadata: {
        statusCode: res.statusCode,
        durationMs,
        userId: (req as any).user?.id ?? null,
        pid: process.pid,
        environment: process.env['NODE_ENV'] ?? 'development',
      },
      service: process.env['SERVICE_NAME'] ?? 'unknown-service',
    }
    void logger.log(resRecord)
  })

  next()
}
