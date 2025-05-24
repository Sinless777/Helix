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
 * Interceptor to log each HTTP request and response in NestJS applications.
 * Captures entry, exit, and errors with context and metadata.
 */
@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  /**
   * Intercept the request, logging before and after the handler.
   * @param context Execution context of the request
   * @param next Call handler for the request pipeline
   * @returns Observable of the response stream
   */
  public intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const method = req.method
    const url = req.url
    const handlerName = context.getHandler().name
    const startTime = Date.now()

    // Log request entry
    const entryRecord: LogRecord = {
      timestamp: new Date().toISOString(),
      level: 'trace',
      message: `${method} ${url} -> ${handlerName}`,
      context: 'HTTP',
      // Top-level service for routing and driver metadata
      service: process.env['SERVICE_NAME'] || 'unknown',
      metadata: {
        traceId: req.headers['x-trace-id'],
        spanId: req.headers['x-span-id'],
        userId: req.headers['user-id'],
        version: process.env['APP_VERSION'],
        host: req.headers['host'],
        pid: process.pid,
        env: process.env['NODE_ENV'],
      },
    }
    logger.log(entryRecord)

    return next.handle().pipe(
      tap(
        // On successful response
        (data) => {
          const durationMs = Date.now() - startTime
          const successRecord: LogRecord = {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `${method} ${url} <- ${handlerName}`,
            context: 'HTTP',
            service: process.env['SERVICE_NAME'] || 'unknown',
            metadata: {
              traceId: req.headers['x-trace-id'],
              spanId: req.headers['x-span-id'],
              userId: req.headers['user-id'],
              version: process.env['APP_VERSION'],
              host: req.headers['host'],
              pid: process.pid,
              env: process.env['NODE_ENV'],
              durationMs,
              response: data,
            },
          }
          logger.log(successRecord)
        },
        // On error
        (error) => {
          const durationMs = Date.now() - startTime
          const errorRecord: LogRecord = {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: `${method} ${url} !> ${handlerName}`,
            context: 'HTTP',
            service: process.env['SERVICE_NAME'] || 'unknown',
            metadata: {
              traceId: req.headers['x-trace-id'],
              spanId: req.headers['x-span-id'],
              userId: req.headers['user-id'],
              version: process.env['APP_VERSION'],
              host: req.headers['host'],
              pid: process.pid,
              env: process.env['NODE_ENV'],
              durationMs,
              exception: {
                message: error.message,
                stack: error.stack,
              },
            },
          }
          logger.log(errorRecord)
        },
      ),
    )
  }
}
