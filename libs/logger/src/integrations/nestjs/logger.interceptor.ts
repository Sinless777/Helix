// libs/logger/src/integrations/nestjs/logger.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { logger } from '../../lib/Logger'
import type { LogRecord } from '../../types/LogRecord'

/**
 * Intercepts all incoming HTTP requests and outgoing responses (or errors) in a NestJS application.
 * Logs detailed structured records at three key points:
 *  1. Request entry (trace level)
 *  2. Successful response (info level)
 *  3. Error response (error level)
 *
 * @remarks
 * - Includes context (`HTTP`) and metadata such as trace IDs, user IDs, handler name, timing, environment, etc.
 * - Uses the shared `logger` singleton for dispatching records to configured drivers.
 * - Respects asynchronous pipeline by tapping into the response observable.
 *
 * @example
 * ```ts
 * // In your module:
 * @UseInterceptors(LoggerInterceptor)
 * @Controller('cats')
 * export class CatsController { … }
 * ```
 *
 * @public
 */
@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  /**
   * Intercepts the request/response cycle.
   *
   * @param context - NestJS execution context, provides access to request and handler metadata.
   * @param next - Call handler to continue the request pipeline.
   * @returns An observable stream of the handler's result, with side-effect logging.
   */
  public intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    // Extract HTTP request info
    const req = context.switchToHttp().getRequest()
    const method = req.method
    const url = req.url
    const handlerName = context.getHandler().name
    const startTime = Date.now()

    /**
     * Log entry record capturing request arrival.
     */
    const entryRecord: LogRecord = {
      timestamp: new Date().toISOString(),
      level: 'trace',
      message: `→ ${method} ${url} → ${handlerName}`,
      context: 'HTTP',
      service: process.env['SERVICE_NAME'] ?? 'unknown-service',
      metadata: {
        traceId: req.headers['x-trace-id'] as string | undefined,
        spanId: req.headers['x-span-id'] as string | undefined,
        userId: req.headers['user-id'] as string | undefined,
        version: process.env['APP_VERSION'] ?? undefined,
        host: req.headers['host'] as string | undefined,
        pid: process.pid,
        env: process.env['NODE_ENV'] ?? 'development',
      },
    }

    // Dispatch entry log (fire-and-forget)
    void logger.log(entryRecord)

    // Continue pipeline and tap into result for exit logs
    return next.handle().pipe(
      tap(
        /**
         * @param data - Handler response payload
         */
        (data) => {
          const durationMs = Date.now() - startTime

          /**
          /**
           * Log record for successful response.
           */
          const successRecord: LogRecord = {
            level: 'info',
            message: `← ${method} ${url} ← ${handlerName}`,
            context: 'HTTP',
            service: process.env['SERVICE_NAME'] ?? 'unknown-service',
            metadata: {
              traceId: req.headers['x-trace-id'] as string | undefined,
              spanId: req.headers['x-span-id'] as string | undefined,
              userId: req.headers['user-id'] as string | undefined,
              version: process.env['APP_VERSION'] ?? undefined,
              host: req.headers['host'] as string | undefined,
              pid: process.pid,
              env: process.env['NODE_ENV'] ?? 'development',
              durationMs,
              response: data,
            },
            timestamp: new Date().toISOString(),
          }

          void logger.log(successRecord)
        },
        /**
         * @param error - Thrown error from handler
         */
        (error) => {
          const durationMs = Date.now() - startTime

          /**
           * Log record for error response.
           */
          const errorRecord: LogRecord = {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: `‼ ${method} ${url} ‼ ${handlerName}`,
            context: 'HTTP',
            service: process.env['SERVICE_NAME'] ?? 'unknown-service',
            metadata: {
              traceId: req.headers['x-trace-id'] as string | undefined,
              spanId: req.headers['x-span-id'] as string | undefined,
              userId: req.headers['user-id'] as string | undefined,
              version: process.env['APP_VERSION'] ?? undefined,
              host: req.headers['host'] as string | undefined,
              pid: process.pid,
              env: process.env['NODE_ENV'] ?? 'development',
              durationMs,
              exception: {
                message: error?.message,
                stack: error?.stack,
              },
            },
          }

          void logger.log(errorRecord)
        },
      ),
    )
  }
}
