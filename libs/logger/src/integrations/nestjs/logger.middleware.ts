import { Injectable, NestMiddleware } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'
import { logger } from '../../lib/Logger'
import type { LogRecord } from '../../types/LogRecord'

/**
 * NestJS middleware for logging HTTP requests and responses.
 * Applies to routes configured in your module (e.g., via `app.use()` or consumer).
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now()

    const baseRecord: Omit<LogRecord, 'timestamp'> = {
      level: 'info',
      service: 'nestjs-logger-middleware',
      message: 'HTTP transaction',
      context: `${req.method} ${req.originalUrl}`,
      metadata: {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        params: req.params,
        query: req.query,
        userId: (req as any).user?.id ?? null,
        host: req.hostname,
        pid: process.pid,
        environment: process.env['NODE_ENV'] ?? 'development',
      },
    }

    // Log incoming request
    void logger.log({ timestamp: new Date().toISOString(), ...baseRecord })

    // After response finished
    res.on('finish', () => {
      const duration = Date.now() - startTime
      const responseRecord: LogRecord = {
        timestamp: new Date().toISOString(),
        ...baseRecord,
        level: res.statusCode >= 500 ? 'error' : 'info',
        message: `HTTP response ${res.statusCode}`,
        metadata: {
          ...baseRecord.metadata!,
          statusCode: res.statusCode,
          durationMs: duration,
        },
      }
      void logger.log(responseRecord)
    })

    next()
  }
}
