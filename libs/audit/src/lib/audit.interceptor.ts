import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  Optional,
  Scope,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'

import {
  AUDIT_MODULE_OPTIONS,
  INCLUDE_REQUEST_BODY_DEFAULT,
  INCLUDE_RESPONSE_BODY_DEFAULT,
} from './constants'
import type { AuditModuleOptions } from './constants'

import { AuditService } from './audit.service'
import { resolveAuditAction } from './decorators/audit-action.decorator'
import { resolveAuditResource } from './decorators/audit-resource.decorator'
import { META_AUDIT_ACTION, META_AUDIT_RESOURCE } from './constants'

import {
  redactHeaders,
  redactQuery,
  redactValue,
  scrubUrl,
} from './utils/redact.util'

/**
 * Intercepts controller calls to:
 *  - Resolve @AuditAction / @AuditResource metadata
 *  - Capture request context (method, url, headers, query, params, body*)
 *  - Emit success/failure audit rows via AuditService
 *
 * By default, only handlers decorated with @AuditAction are recorded.
 * You can change this behavior by setting `enabled` in the module options
 * and mapping a fallback action for undecorated routes if desired.
 */
@Injectable({ scope: Scope.REQUEST })
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly audit: AuditService,
    @Optional()
    @Inject(AUDIT_MODULE_OPTIONS)
    private readonly moduleOpts?: AuditModuleOptions
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Resolve metadata (method-level takes precedence over class-level)
    const handler = context.getHandler()
    const target = context.getClass()

    const actionMeta =
      this.reflector.get(META_AUDIT_ACTION, handler) ??
      this.reflector.get(META_AUDIT_ACTION, target)

    const resourceMeta =
      this.reflector.get(META_AUDIT_RESOURCE, handler) ??
      this.reflector.get(META_AUDIT_RESOURCE, target)

    // If no @AuditAction on the handler/class, skip auditing by default.
    // (You can customize this policy here if you want global auditing.)
    if (!actionMeta) {
      return next.handle()
    }

    // Extract a best-effort HTTP-like request object
    const req = resolveRequest(context)

    // Compute redaction prefs
    const includeReqBody =
      this.moduleOpts?.includeRequestBody ?? INCLUDE_REQUEST_BODY_DEFAULT
    const includeResBody =
      this.moduleOpts?.includeResponseBody ?? INCLUDE_RESPONSE_BODY_DEFAULT

    // Prepare static request metadata (response body captured in tap)
    const method: string | undefined = safeStr(req?.method)
    const url: string | undefined = req
      ? scrubUrl(req.originalUrl || req.url || '')
      : undefined
    const headers = redactHeaders(req?.headers)
    const query = redactQuery(req?.query)
    const params = req?.params ?? undefined
    const body = includeReqBody ? redactValue(req?.body) : undefined

    // Resolve action/resource now (factories may need params/request)
    const resolvedAction = resolveAuditAction(actionMeta, {
      params: getHandlerParams(context),
      request: req,
    })

    const resolvedResource = resolveAuditResource(resourceMeta as any, {
      params: getHandlerParams(context),
      request: req,
    })

    // If somehow no action resolved (e.g., factory threw), skip gracefully.
    if (!resolvedAction) {
      return next.handle()
    }

    // Emit success/failure after handler completes
    return next.handle().pipe(
      tap(async (result) => {
        const metadata: Record<string, unknown> = {
          request: {
            method,
            url,
            headers,
            query,
            params,
            body,
          },
        }

        if (includeResBody) {
          metadata['response'] = redactValue(result)
        }

        await this.audit.success(resolvedAction, {
          resource: resolvedResource,
          metadata,
          // you can attach tags per route pattern if desired
          // tags: ['http', method?.toLowerCase()].filter(Boolean) as string[],
        })
      }),
      catchError((err) => {
        // On errors, record failure with message & (optional) sanitized response
        const metadata: Record<string, unknown> = {
          request: {
            method,
            url,
            headers,
            query,
            params,
            body,
          },
          error: {
            name: err?.name,
            message: safeStr(err?.message),
            status: statusFromError(err),
          },
        }

        // Fire-and-forget; do not block the error flow
        void this.audit.failure(resolvedAction, safeStr(err?.message), {
          resource: resolvedResource,
          metadata,
        })

        return throwError(() => err)
      })
    )
  }
}

// ───────────────────────────── internals ─────────────────────────────

/** Pull a best-effort HTTP request from various Nest context types. */
function resolveRequest(context: ExecutionContext): any {
  const type = context.getType<'http' | 'rpc' | 'ws' | string>()
  if (type === 'http') {
    return context.switchToHttp().getRequest()
  }

  // GraphQL support without importing @nestjs/graphql
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gctx: any = tryGetGraphQLContext(context)
  if (gctx?.req) return gctx.req
  if (gctx?.request) return gctx.request

  // Fallback: try first arg (often the request in custom adapters)
  try {
    return context.getArgByIndex?.(0)
  } catch {
    return undefined
  }
}

/** Attempt to access a GraphQL context without importing GqlExecutionContext. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tryGetGraphQLContext(context: ExecutionContext): any {
  try {
    // Lazy require to avoid hard dependency
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GqlExecutionContext } = require('@nestjs/graphql')
    return GqlExecutionContext.create(context).getContext?.()
  } catch {
    return undefined
  }
}

/** Gather handler params (best-effort; framework-agnostic). */
function getHandlerParams(context: ExecutionContext): unknown[] {
  try {
    const type = context.getType<'http' | 'rpc' | 'ws' | string>()
    if (type === 'http') {
      const http = context.switchToHttp()
      return [http.getRequest(), http.getResponse(), http.getNext?.()]
    }
    // Fallback to raw args
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (context as any).getArgs?.() ?? []
  } catch {
    return []
  }
}

function safeStr(v: unknown): string | undefined {
  return typeof v === 'string' && v.length ? v : undefined
}

function statusFromError(err: unknown): number | undefined {
  // Nest HttpException has getStatus()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyErr = err as any
  if (typeof anyErr?.getStatus === 'function') {
    try {
      const code = anyErr.getStatus()
      return typeof code === 'number' ? code : undefined
    } catch {
      /* ignore */
    }
  }
  // Fallback to known fields
  const code =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    anyErr?.status ?? anyErr?.statusCode ?? anyErr?.response?.statusCode
  return typeof code === 'number' ? code : undefined
}
