/**
 * Common constants and DI tokens for the Audit module.
 * These are used by decorators, interceptors, and services to coordinate
 * action/resource metadata, context extraction, and redaction policy.
 */

// ───────────────────────────── DI tokens ─────────────────────────────

/** Module options token (for .forRoot/.forRootAsync) */
export const AUDIT_MODULE_OPTIONS = 'AUDIT_MODULE_OPTIONS'

/** Inject to get request-scoped audit context (actor/ip/ua/requestId). */
export const AUDIT_CONTEXT = 'AUDIT_CONTEXT'

/** Optional provider token for a custom context extractor implementation. */
export const AUDIT_CONTEXT_EXTRACTOR = 'AUDIT_CONTEXT_EXTRACTOR'

// ─────────────────────────── metadata keys ───────────────────────────

/** Used by @AuditAction('...') */
export const META_AUDIT_ACTION = 'audit:action'

/** Used by @AuditResource('EntityName' | (() => string), idSelector?) */
export const META_AUDIT_RESOURCE = 'audit:resource'

/** Optional: @AuditRedact(['password', 'secret']) to add per-handler keys */
export const META_AUDIT_REDACT = 'audit:redact'

// ───────────────────────────── HTTP keys ─────────────────────────────

/** Preferred header for tracing correlation */
export const HEADER_REQUEST_ID = 'x-request-id'

/** Headers commonly set by proxies/CDNs to convey the real client IP */
export const IP_FORWARD_HEADERS = [
  'x-forwarded-for',
  'cf-connecting-ip',
  'true-client-ip',
  'x-real-ip',
] as const

/** User agent header */
export const HEADER_USER_AGENT = 'user-agent'

// ───────────────────────── redaction defaults ────────────────────────

/** Keys that should be masked in bodies/params by default */
export const DEFAULT_REDACT_KEYS = [
  'password',
  'newPassword',
  'currentPassword',
  'passwordHash',
  'secret',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'api_key',
  'authorization',
  'cookie',
  'cookies',
  'set-cookie',
  'client_secret',
  'privateKey',
  'publicKey', // sometimes too large; still safe to keep, but mask by default if desired
] as const

/** Query string params to mask by default */
export const DEFAULT_REDACT_QUERY_PARAMS = [
  'token',
  'access_token',
  'refresh_token',
  'api_key',
  'code', // oauth code
  'state', // oauth state
] as const

/** Replacement used when masking values */
export const REDACT_REPLACEMENT = '***'

/** Maximum size (in bytes) of serialized diff stored in audit_log.diff (defensive cap) */
export const MAX_DIFF_BYTES = 64 * 1024 // 64KB

// ─────────────────────────── module defaults ─────────────────────────

/** Toggle audit globally (feature flag friendly) */
export const AUDIT_ENABLED_DEFAULT = true

/** Whether to include request bodies by default in audit meta (safe subset only) */
export const INCLUDE_REQUEST_BODY_DEFAULT = false

/** Whether to include response bodies by default in audit meta (usually no) */
export const INCLUDE_RESPONSE_BODY_DEFAULT = false

// ─────────────────────────── type helpers ────────────────────────────

export type RedactKey = (typeof DEFAULT_REDACT_KEYS)[number]
export type RedactQueryParam = (typeof DEFAULT_REDACT_QUERY_PARAMS)[number]

export interface AuditModuleOptions {
  enabled?: boolean
  redactKeys?: ReadonlyArray<string>
  redactQueryParams?: ReadonlyArray<string>
  redactReplacement?: string
  includeRequestBody?: boolean
  includeResponseBody?: boolean
  maxDiffBytes?: number
}
