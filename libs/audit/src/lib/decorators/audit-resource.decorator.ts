import { SetMetadata } from '@nestjs/common'
import { META_AUDIT_RESOURCE } from '../constants'
import { type AuditResource, AuditResourceInput } from '../types/audit.types'

/**
 * @AuditResource('User')
 * @AuditResource({ type: 'User', id: ':id' })
 * @AuditResource(({ params }) => ({ type: 'User', id: (params?.[0] as any)?.id }))
 *
 * Attaches resource metadata to a controller/handler.
 * Store either a string type, a full AuditResource, or a factory function.
 */
export function AuditResource(
  resource: AuditResourceInput
): MethodDecorator & ClassDecorator {
  return SetMetadata(META_AUDIT_RESOURCE, resource)
}

/** Normalize any supported input into an AuditResource, or undefined on failure. */
export function normalizeAuditResource(
  input: string | AuditResource | undefined
): AuditResource | undefined {
  if (!input) return undefined
  if (typeof input === 'string') {
    const t = input.trim()
    return t ? { type: t } : undefined
  }
  if (typeof input === 'object') {
    const type = String((input as AuditResource).type ?? '').trim()
    if (!type) return undefined
    const id = (input as AuditResource).id
    const display = (input as AuditResource).display ?? null
    return { type, id: id as any, display }
  }
  return undefined
}

/**
 * Resolve the effective AuditResource from decorator metadata.
 * Pass handler args and optionally the result/request so factories can compute.
 */
export function resolveAuditResource(
  meta: AuditResourceInput | undefined,
  args: {
    params: unknown[]
    result?: unknown
    request?: unknown
  }
): AuditResource | undefined {
  if (!meta) return undefined

  try {
    if (typeof meta === 'function') {
      const out = meta({
        params: args.params,
        result: args.result,
        request: args.request,
      })
      return normalizeAuditResource(out as any)
    }
    return normalizeAuditResource(meta as any)
  } catch {
    return undefined
  }
}

/** Helpful label for logs/metrics (e.g., "User:1234" or just "User"). */
export function auditResourceLabel(r?: AuditResource): string | undefined {
  if (!r) return undefined
  return r.id != null ? `${r.type}:${String(r.id)}` : r.type
}
