import { Injectable, Provider, Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import {
  AUDIT_CONTEXT,
  AUDIT_CONTEXT_EXTRACTOR,
  HEADER_REQUEST_ID,
  HEADER_USER_AGENT,
  IP_FORWARD_HEADERS,
} from '../constants'
import { AuditContext, AuditContextExtractor } from '../types/audit.types'

@Injectable()
export class DefaultAuditContextExtractor implements AuditContextExtractor {
  extract(req: unknown): AuditContext {
    const r = toAny(req)

    // Headers (Fastify keeps them on req.headers; Express on req.headers too)
    const headers: Record<string, any> = (r?.headers ??
      r?.raw?.headers ??
      {}) as Record<string, any>

    // Request/trace id
    const requestId =
      headers[HEADER_REQUEST_ID] ??
      r?.id ??
      r?.requestId ??
      r?.context?.requestId ??
      undefined

    // Client IP (prefer forwarded headers, then framework-provided fields)
    const ip = resolveClientIp(r, headers)

    // User-Agent
    const userAgent: string | undefined =
      headers[HEADER_USER_AGENT] ??
      headers[HEADER_USER_AGENT.toUpperCase()] ??
      r?.userAgent ??
      undefined

    // Actor hints (keep this flexible to work with different auth middlewares)
    const userId: string | null =
      r?.user?.id ?? r?.auth?.userId ?? r?.session?.userId ?? null

    const orgId: string | null =
      r?.orgId ?? r?.auth?.orgId ?? r?.user?.orgId ?? null

    const teamId: string | null = r?.teamId ?? r?.auth?.teamId ?? null

    const sessionId: string | null =
      r?.session?.id ?? r?.sessionId ?? r?.cookies?.sid ?? null

    const apiKeyId: string | null = r?.apiKey?.id ?? r?.auth?.apiKeyId ?? null

    // Optional geo hints from common edge/CDN headers or frameworks
    const geo = resolveGeo(r, headers)

    // Service marker (gateway/edge/service name if you set it upstream)
    const service: string | null =
      r?.service ?? r?.requestContext?.service ?? null

    // Extra bag for anything upstream injected (feature flags, ab bucket, etc.)
    const extra: Record<string, unknown> | null =
      r?.auditExtra ?? r?.context?.auditExtra ?? null

    return {
      userId,
      orgId,
      teamId,
      sessionId,
      apiKeyId,
      ip,
      userAgent: userAgent ?? null,
      requestId: requestId ?? null,
      geo,
      service,
      extra,
    }
  }
}

// ───────────────────────────── Providers ─────────────────────────────

/** Bind a default extractor (can be overridden by providing AUDIT_CONTEXT_EXTRACTOR yourself). */
export const AuditContextExtractorProvider: Provider = {
  provide: AUDIT_CONTEXT_EXTRACTOR,
  useClass: DefaultAuditContextExtractor,
}

/** Request-scoped provider that yields the computed AuditContext for DI. */
export const AuditContextProvider: Provider = {
  provide: AUDIT_CONTEXT,
  scope: Scope.REQUEST,
  inject: [REQUEST, AUDIT_CONTEXT_EXTRACTOR],
  useFactory: async (
    req: unknown,
    extractor?: AuditContextExtractor
  ): Promise<AuditContext> => {
    const ex = extractor ?? new DefaultAuditContextExtractor()
    try {
      const out = await Promise.resolve(ex.extract(req))
      // Ensure all optional fields exist as null/undefined cleanly
      return {
        ...out,
        requestId: out.requestId ?? null,
        ip: out.ip ?? null,
        userAgent: out.userAgent ?? null,
      }
    } catch {
      return {
        requestId: null,
        ip: null,
        userAgent: null,
      }
    }
  },
}

// ───────────────────────────── Internals ─────────────────────────────

function toAny<T = any>(v: unknown): T {
  return v as T
}

/** Best-effort client IP extraction (handles proxies and framework quirks). */
function resolveClientIp(
  req: any,
  headers: Record<string, any>
): string | undefined {
  // 1) Forwarded chain headers (pick first non-empty)
  for (const h of IP_FORWARD_HEADERS) {
    const raw = headers[h]
    if (!raw) continue
    const ip = pickForwardedIp(String(raw))
    if (ip) return normalizeIp(ip)
  }

  // 2) Framework-provided fields
  const fromFramework =
    req?.ip ??
    (Array.isArray(req?.ips) && req.ips.length ? req.ips[0] : undefined) ??
    req?.socket?.remoteAddress ??
    req?.connection?.remoteAddress ??
    undefined

  return fromFramework ? normalizeIp(String(fromFramework)) : undefined
}

/** x-forwarded-for may be a comma-separated list (client, proxy1, proxy2, ...) */
function pickForwardedIp(chain: string): string | undefined {
  if (!chain) return undefined
  const parts = chain
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (!parts.length) return undefined
  // Usually first is the client IP. Prefer first valid-looking entry.
  return parts[0]
}

/** Trim IPv6 prefix forms like ::ffff:127.0.0.1 and bracketed literals. */
function normalizeIp(ip: string): string {
  let v = ip.trim()
  if (v.startsWith('::ffff:')) v = v.slice(7)
  if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1)
  return v
}

/** Extract rough geo hints from common headers or pre-parsed req.geo */
function resolveGeo(
  req: any,
  headers: Record<string, any>
): AuditContext['geo'] {
  const g = req?.geo ?? req?.requestContext?.geo ?? {}
  const country =
    g?.country ??
    headers['cf-ipcountry'] ??
    headers['x-vercel-ip-country'] ??
    headers['x-appengine-country'] ??
    undefined

  const region =
    g?.region ??
    headers['x-vercel-ip-country-region'] ??
    headers['x-appengine-region'] ??
    undefined

  const city = g?.city ?? headers['x-vercel-ip-city'] ?? undefined

  const timezone = g?.timezone ?? headers['x-vercel-ip-timezone'] ?? undefined

  const latRaw = g?.latitude ?? headers['x-vercel-ip-latitude'] ?? undefined

  const lonRaw = g?.longitude ?? headers['x-vercel-ip-longitude'] ?? undefined

  const lat = toNum(latRaw)
  const lon = toNum(lonRaw)

  if (!country && !region && !city && !timezone && lat == null && lon == null) {
    return null
  }
  return {
    country: strOrUndef(country),
    region: strOrUndef(region),
    city: strOrUndef(city),
    timezone: strOrUndef(timezone),
    lat: lat ?? undefined,
    lon: lon ?? undefined,
  }
}

function strOrUndef(v: unknown): string | undefined {
  return typeof v === 'string' && v.length ? v : undefined
}

function toNum(v: unknown): number | undefined {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN
  return Number.isFinite(n) ? n : undefined
}
