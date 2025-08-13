import { SetMetadata } from '@nestjs/common'
import { META_AUDIT_ACTION } from '../constants'
import { type AuditAction, AuditActionInput } from '../types/audit.types'

/**
 * @AuditAction('user.update')
 * or
 * @AuditAction(({ params, result, request }) => `user.update:${(params?.[0] as any)?.id ?? 'unknown'}`)
 *
 * Attach an audit action label (or factory) to a route handler or controller.
 * The value is stored under `META_AUDIT_ACTION` and can be resolved at runtime
 * by an interceptor using `resolveAuditAction`.
 */
export function AuditAction(
  action: AuditActionInput
): MethodDecorator & ClassDecorator {
  return SetMetadata(META_AUDIT_ACTION, action)
}

/**
 * Resolve the effective action string from the decorator’s metadata.
 * Pass your handler args and optionally the return value/request for factories.
 */
export function resolveAuditAction(
  meta: AuditActionInput | undefined,
  args: {
    params: unknown[]
    result?: unknown
    request?: unknown
  }
): AuditAction | undefined {
  if (!meta) return undefined
  if (typeof meta === 'function') {
    // Factory provided by user
    try {
      return meta({
        params: args.params,
        result: args.result,
        request: args.request,
      })
    } catch {
      return undefined
    }
  }
  return meta
}
