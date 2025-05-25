// libs/logger/src/integrations/nestjs/logger.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'
import { logger } from '../../lib/Logger'
import type { LogRecord } from '../../types/LogRecord'

/**
 * NestJS middleware that logs each incoming HTTP request and the corresponding response.
 * Captures method, URL, headers, parameters, query, user information, timing,
 * status codes, and environment, then emits structured `LogRecord`s to the global logger.
 *
 * @public
 * @example
 * ```ts
 * // In your AppModule:
 * @Module({
 *   providers: [LoggerMiddleware],
 * })
 * export class AppModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer.apply(LoggerMiddleware).forRoutes('*')
 *   }
 * }
 * ```
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  /**
   * Intercepts each HTTP request/response pair.
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next middleware function
   * @returns void
   */
  public use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now()

    // Base record template (without timestamp)
    const baseRecord: Omit<LogRecord, 'timestamp'> = {
      level: 'info',
      service: process.env['SERVICE_NAME'] ?? 'nestjs-logger-middleware',
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
    void logger.log({
      timestamp: new Date().toISOString(),
      ...baseRecord,
    })

    // After response, log status and duration
    res.on('finish', () => {
      const durationMs = Date.now() - startTime

      const responseRecord: LogRecord = {
        timestamp: new Date().toISOString(),
        ...baseRecord,
        level: res.statusCode >= 500 ? 'error' : 'info',
        message: `HTTP response ${res.statusCode}`,
        metadata: {
          ...baseRecord.metadata!,
          statusCode: res.statusCode,
          durationMs,
        },
      }

      void logger.log(responseRecord)
    })

    next()
  }
}
