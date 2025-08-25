/**
 * Shared types for the Audit library.
 * Keep these framework-agnostic (no Nest/Express imports) so they can be reused
 * from services, interceptors, and workers.
 */

// ───────────────────────────── JSON helpers ─────────────────────────────

export type JsonPrimitive = string | number | boolean | null
export type JsonArray = JsonValue[]
export type JsonObject = { [key: string]: JsonValue }
export type JsonValue = JsonPrimitive | JsonObject | JsonArray

// ───────────────────────────── Core concepts ────────────────────────────

// ---- AuditAction (put in libs/audit/src/lib/types/audit.types.ts) ----

/** Canonical action strings used across the platform. */
export const AuditActions = {
  // Auth
  AUTH_LOGIN_SUCCESS: 'auth.login.success',
  AUTH_LOGIN_FAILURE: 'auth.login.failure',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_TOKEN_REFRESH_SUCCESS: 'auth.token.refresh.success',
  AUTH_TOKEN_REFRESH_FAILURE: 'auth.token.refresh.failure',
  AUTH_PASSWORD_SET: 'auth.password.set',
  AUTH_PASSWORD_CHANGE: 'auth.password.change',
  AUTH_PASSWORD_RESET_REQUESTED: 'auth.password.reset.requested',
  AUTH_PASSWORD_RESET_SUCCESS: 'auth.password.reset.success',
  AUTH_EMAIL_VERIFICATION_SENT: 'auth.email.verification.sent',
  AUTH_EMAIL_VERIFIED: 'auth.email.verified',

  // MFA
  MFA_TOTP_ENROLL: 'mfa.totp.enroll',
  MFA_TOTP_VERIFY: 'mfa.totp.verify',
  MFA_TOTP_DISABLE: 'mfa.totp.disable',
  MFA_SMS_ENROLL: 'mfa.sms.enroll',
  MFA_SMS_VERIFY: 'mfa.sms.verify',
  MFA_SMS_DISABLE: 'mfa.sms.disable',
  WEBAUTHN_REGISTER: 'webauthn.register',
  WEBAUTHN_VERIFY: 'webauthn.verify',
  WEBAUTHN_REMOVE: 'webauthn.remove',

  // User
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_SOFT_DELETE: 'user.soft_delete',
  USER_RESTORE: 'user.restore',

  // Organization
  ORG_CREATE: 'org.create',
  ORG_UPDATE: 'org.update',
  ORG_DELETE: 'org.delete',
  ORG_MEMBER_ADD: 'org.member.add',
  ORG_MEMBER_REMOVE: 'org.member.remove',
  ORG_MEMBER_ROLE_CHANGE: 'org.member.role.change',

  // Team
  TEAM_CREATE: 'team.create',
  TEAM_UPDATE: 'team.update',
  TEAM_DELETE: 'team.delete',
  TEAM_MEMBER_ADD: 'team.member.add',
  TEAM_MEMBER_REMOVE: 'team.member.remove',
  TEAM_MEMBER_ROLE_CHANGE: 'team.member.role.change',

  // API Keys
  API_KEY_CREATE: 'api_key.create',
  API_KEY_ROTATE: 'api_key.rotate',
  API_KEY_REVOKE: 'api_key.revoke',
  API_KEY_USE: 'api_key.use',

  // OAuth identities
  OAUTH_LINK: 'oauth.link',
  OAUTH_UNLINK: 'oauth.unlink',

  // Security
  SECURITY_TRUSTED_DEVICE_ADD: 'security.trusted_device.add',
  SECURITY_TRUSTED_DEVICE_REMOVE: 'security.trusted_device.remove',
  SECURITY_SESSION_REVOKE: 'security.session.revoke',
  SECURITY_RATE_LIMITED: 'security.rate_limited',
  SECURITY_SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',
} as const

/** Union of all canonical action strings; allow extra custom strings too. */
export type AuditAction =
  | (typeof AuditActions)[keyof typeof AuditActions]
  | (string & {}) // escape hatch for project-specific actions

/** Helper to strongly-type custom actions (optional) */
export const auditAction = <T extends string>(s: T) => s as T & AuditAction

/** Type guard */
export function isAuditAction(v: unknown): v is AuditAction {
  return typeof v === 'string' && v.length > 0
}

/** Outcome classification for the audited operation. */
export type AuditOutcome = 'success' | 'failure' | 'neutral'

/** Optional severity to help triage (maps well to logs/alerts). */
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical'

/** What object/record the action targeted. */
export interface AuditResource {
  /** Logical type (table/entity/model name). Example: "User", "Organization", "ApiKey". */
  type: string
  /** Primary identifier if known (uuid, string id, numeric id, etc.). */
  id?: string | number | null
  /** Optional human label (email/slug/name) for better UX in audit UI. */
  display?: string | null
}

/** Who/what performed the action (user, API key, service). */
export interface AuditActor {
  /** End-user id (uuid). */
  userId?: string | null
  /** Organization/tenant id. */
  orgId?: string | null
  /** Team/scope id if applicable. */
  teamId?: string | null
  /** Session identifier (web session, device session, etc.). */
  sessionId?: string | null
  /** API key id if the call used an API key. */
  apiKeyId?: string | null
}

/** Network/client context captured with the event. */
export interface AuditNetworkContext {
  /** Best-effort client IP (already de-proxied). */
  ip?: string | null
  /** Raw User-Agent string. */
  userAgent?: string | null
  /** Request id / correlation id. */
  requestId?: string | null
  /** Optional geo approximation. */
  geo?: {
    country?: string // "US"
    region?: string // "CA"
    city?: string // "San Francisco"
    timezone?: string // "America/Los_Angeles"
    lat?: number
    lon?: number
  } | null
}

/** Full context available to the audit writer. */
export interface AuditContext extends AuditActor, AuditNetworkContext {
  /** Name of the calling service/edge/gateway (if known). */
  service?: string | null
  /** Arbitrary context (route, handler, feature flags, AB bucket, etc.). */
  extra?: Record<string, unknown> | null
}

/** Representation of the change. Pick the flavor you record. */
export interface AuditDiff {
  /** Redacted snapshot before the change (optional). */
  before?: JsonValue
  /** Redacted snapshot after the change (optional). */
  after?: JsonValue
  /** RFC6902 JSON Patch operations (optional, if you compute patches). */
  jsonPatch?: JsonObject[] // keep “any”-ish without importing a patch lib
  /** Size accounting (post-serialization) for defensive caps. */
  bytes?: number
  /** True if diff/snapshots were truncated to meet size limits. */
  truncated?: boolean
}

/** High-level event written to the audit log. */
export interface AuditEvent {
  /** When it happened (server time). */
  timestamp: Date
  /** Action label, e.g., "user.update". */
  action: AuditAction

  /** Target resource (what was touched). */
  resource?: AuditResource

  /** Actor & request context. */
  actor?: AuditActor
  context?: AuditContext

  /** Result classification and optional severity/message. */
  outcome?: AuditOutcome
  severity?: AuditSeverity
  message?: string | null

  /** Change representation. */
  diff?: AuditDiff

  /** Arbitrary metadata (safe to store & display). */
  metadata?: Record<string, unknown> | null

  /** Simple tags for faceted search (e.g., ["mfa","security"]). */
  tags?: string[] | null
}

// ───────────────────────────── Writer contracts ─────────────────────────

/** Options that influence how the interceptor/service serializes & redacts. */
export interface AuditWriteOptions {
  /** Keys to redact in objects (nested paths allowed by your redacter). */
  redactKeys?: ReadonlyArray<string>
  /** Querystring keys to redact. */
  redactQueryParams?: ReadonlyArray<string>
  /** Replacement token for masked values. */
  redactReplacement?: string
  /** Maximum serialized bytes for `diff`; truncate if exceeded. */
  maxDiffBytes?: number
  /** Whether to include (redacted) request body in `metadata`. */
  includeRequestBody?: boolean
  /** Whether to include (redacted) response body in `metadata`. */
  includeResponseBody?: boolean
}

/** Minimal interface for a context extractor provider (DI). */
export interface AuditContextExtractor {
  /**
   * Extract AuditContext from a framework request object.
   * Keep `req` as `unknown` to avoid hard framework coupling.
   */
  extract(req: unknown): Promise<AuditContext> | AuditContext
}

/** A redaction function signature your utils can implement. */
export type RedactFn = (
  input: unknown,
  keys: ReadonlyArray<string>,
  replacement: string
) => unknown

// ───────────────────────────── Decorator helpers ───────────────────────

/** What @AuditResource decorator can accept. */
export type AuditResourceInput =
  | string
  | AuditResource
  | ((args: {
      /** Original method args (for Nest handler/method decorators). */
      params: unknown[]
      /** Optionally pass the return value when using interceptors. */
      result?: unknown
      /** Optionally pass the framework request/ctx. */
      request?: unknown
    }) => AuditResource | string)

/** What @AuditAction decorator can accept. */
export type AuditActionInput =
  | AuditAction
  | ((args: {
      params: unknown[]
      result?: unknown
      request?: unknown
    }) => AuditAction)
