// libs/logger/src/integrations/nestjs/logger.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'
import { logger } from '../../lib/Logger'
import type { LogRecord } from '../../types/LogRecord'

/**
 * @class LoggerMiddleware
 * @implements NestMiddleware
 *
 * @description
 * NestJS middleware that logs each incoming HTTP request and corresponding response.
 * Captures method, URL, headers, parameters, query, user information, timing,
 * status codes, and environment, then emits structured `LogRecord`s to the global logger.
 *
 * @example
 * ```ts
 * // In your module:
 * @Module({
 *   providers: [LoggerMiddleware],
 * })
 * export class AppModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(LoggerMiddleware)
 *       .forRoutes('*')
 *   }
 * }
 * ```
 *
 * @public
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  /**
   * Intercepts each HTTP request/response pair.
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next function to pass control to the following middleware
   *
   * @method
   * @returns void
   */
  public use(req: Request, res: Response, next: NextFunction): void {
    // Record start time for latency measurement
    const startTime = Date.now()

    /**
     * Base record template for both request and response logs.
     * Omits timestamp since it is generated at log time.
     *
     * @type {Omit<LogRecord, 'timestamp'>}
     * @property {string} level - Log severity level
     * @property {string} service - Identifier for this middleware/service
     * @property {string} message - Descriptive message
     * @property {string} context - Context string (HTTP method + URL)
     * @property {Record<string, any>} metadata - Key/value metadata
     */
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

    // Log the incoming request record immediately
    void logger.log({
      timestamp: new Date().toISOString(),
      ...baseRecord,
    })

    // After response is finished, log the response with status and duration
    res.on('finish', () => {
      const duration = Date.now() - startTime

      /**
       * @type {LogRecord}
       * @description Record capturing the HTTP response details.
       * Extends baseRecord with updated level, message, and additional metadata.
       */
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

    // Proceed to the next middleware or route handler
    next()
  }
}
