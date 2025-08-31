// libs/auth/src/lib/constants/auth.constants.ts

/**
 * Centralized constants for the Auth library.
 * Keep this file dependency-free and only export primitives/types/helpers.
 */

/** Well-known JWKS endpoint path (served by your app router). */
export const JWKS_WELL_KNOWN_PATH = '/.well-known/jwks.json' as const

/** JWT defaults (override via config at runtime). */
export const JWT = {
  /** RFC7518 alg for access/refresh signing. */
  ALG: 'RS256',
  /** Default issuer / audience (override per-env). */
  ISSUER_DEFAULT: 'helix',
  AUDIENCE_DEFAULT: 'helix.api',
  /** Leeway to tolerate minor clock skew (seconds). */
  CLOCK_SKEW_SECONDS: 30,
  /** Access token lifetime (seconds). */
  ACCESS_TTL_SECONDS: 15 * 60, // 15m
  /** Refresh token lifetime (seconds). */
  REFRESH_TTL_SECONDS: 30 * 24 * 60 * 60, // 30d
  /**
   * Refresh "family" retention for reuse detection (seconds).
   * Keep longer than a single refresh to catch replay attempts.
   */
  REFRESH_FAMILY_TTL_SECONDS: 45 * 24 * 60 * 60 // 45d
} as const

/** Token ID prefixes for easy identification in logs/traces. */
export const TOKEN_ID_PREFIX = {
  ACCESS: 'at_',
  REFRESH: 'rt_'
} as const

/** Standard and custom claim names used across the system. */
export const CLAIM = {
  SUB: 'sub',
  ISS: 'iss',
  AUD: 'aud',
  EXP: 'exp',
  IAT: 'iat',
  NBF: 'nbf',
  JTI: 'jti',
  /** Space-delimited OAuth-style scope string (or array in some flows). */
  SCOPE: 'scope',
  /** Organization/tenant context. */
  ORG_ID: 'org',
  /** Session identifier (ties AT/RT to a session record). */
  SID: 'sid',
  /** Token version for forced logout/rotation strategies. */
  VER: 'ver'
} as const

/** Common header names used by the auth layer. */
export const HEADER = {
  AUTHORIZATION: 'authorization',
  /** Convenience constant for prefix checking/formatting. */
  BEARER_PREFIX: 'Bearer ',
  /** Optional: send refresh token via header (prefer cookies in browsers). */
  REFRESH_TOKEN: 'x-refresh-token',
  /** Optional CSRF header when using double-submit cookie. */
  CSRF: 'x-csrf-token',
  /** Multitenancy / org scoping hint. */
  TENANT_ID: 'x-tenant-id',
  /** Trace / correlation id passthrough. */
  REQUEST_ID: 'x-request-id'
} as const

/** Default cookie names + baseline flags. Override via Nest Config if needed. */
export type SameSite = 'lax' | 'strict' | 'none'
export interface CookieDefaults {
  name: string
  path: string
  httpOnly: boolean
  secure: boolean
  sameSite: SameSite
  /** Optional explicit domain; default empty means host-only cookie. */
  domain?: string
  /** In seconds; undefined leaves it as a session cookie. */
  maxAgeSeconds?: number
}

export const COOKIES = {
  ACCESS: {
    name: 'hxa_at',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as SameSite
    // Typically short-lived; apps often keep AT in memory instead of cookie.
  } as CookieDefaults,
  REFRESH: {
    name: 'hxa_rt',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as SameSite,
    maxAgeSeconds: JWT.REFRESH_TTL_SECONDS
  } as CookieDefaults,
  /** Optional double-submit CSRF token cookie (readable by JS). */
  CSRF: {
    name: 'hxa_csrf',
    path: '/',
    httpOnly: false,
    secure: true,
    sameSite: 'lax' as SameSite
  } as CookieDefaults
} as const

/** Redis namespaces used by auth (keep in sync with libs/redis naming). */
export const REDIS_NS = {
  /** Denylist by JTI: jwt:deny:{jti} -> "1" */
  JWT_DENY: 'jwt:deny',
  /**
   * Refresh "family" keys to track valid lineage and detect reuse:
   * rt:family:{sub}:{sid} -> JSON metadata (active jti/rid, timestamps)
   */
  RT_FAMILY: 'rt:family',
  /** Optional reverse index: rt:index:{rid} -> rt:family:{sub}:{sid} */
  RT_INDEX: 'rt:index',
  /** OAuth state/PKCE storage during provider handshakes. */
  OAUTH_STATE: 'oauth:state'
} as const

/** Small helpers to produce concrete Redis keys consistently. */
export const redisKeys = {
  jwtDeny: (jti: string) => `${REDIS_NS.JWT_DENY}:${jti}`,
  rtFamily: (sub: string, sid: string) => `${REDIS_NS.RT_FAMILY}:${sub}:${sid}`,
  rtIndex: (rid: string) => `${REDIS_NS.RT_INDEX}:${rid}`,
  oauthState: (stateId: string) => `${REDIS_NS.OAUTH_STATE}:${stateId}`
} as const

/** Handy helper to format a Bearer token value. */
export const bearer = (token: string) => `${HEADER.BEARER_PREFIX}${token}`

/** Environment variable names consumed by the auth config (optional). */
export const ENV = {
  JWT_ISSUER: 'AUTH_JWT_ISSUER',
  JWT_AUDIENCE: 'AUTH_JWT_AUDIENCE',
  JWKS_BASE_URL: 'AUTH_JWKS_BASE_URL',
  /** Comma-separated audiences if multiple are allowed. */
  JWT_AUDIENCES: 'AUTH_JWT_AUDIENCES',
  /** Rotation period in days; fallback uses JWT.REFRESH_FAMILY_TTL_SECONDS. */
  JWKS_ROTATION_DAYS: 'AUTH_JWKS_ROTATION_DAYS'
} as const
