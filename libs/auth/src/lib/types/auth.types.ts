// libs/auth/src/lib/types/auth.types.ts

/**
 * General Auth types used by guards, services, and adapters.
 * Keep this file runtime-dependency free (no Nest/Express imports).
 */

import type {
  AnyTokenPayload,
  TokenPair,
  JwtString,
  Subject,
  SessionId,
  Jti
} from './token.types'

/* --------------------------------- Scopes --------------------------------- */

/** Resources governed by scopes (expand as needed). */
export type ScopeResource =
  | 'org'
  | 'users'
  | 'teams'
  | 'keys'
  | 'sessions'
  | 'webauthn'
  | 'mfa'
  | 'audit'
  | 'featureflags'

/** Allowed actions (coarse-grained). */
export type ScopeAction = 'read' | 'write' | 'manage'

/** Canonical "resource.action" scope string (e.g., "users.read"). */
export type Scope = `${ScopeResource}.${ScopeAction}`

/** Helper for decorators/guards to specify requirements. */
export type ScopeRequirement = Scope | Scope[]
export type ScopeMatchMode = 'all' | 'any'

export interface ScopesRequirement {
  required: Scope[]
  mode?: ScopeMatchMode // default: 'all'
}

/* --------------------------------- Roles ---------------------------------- */

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER'

/* ------------------------------ User Principal ---------------------------- */

export interface PrincipalSummary {
  /** User id (UUID string). */
  id: Subject | string
  email?: string | null
  displayName?: string | null
  /** Default/active org context. */
  orgId?: string | null
  /** Optional team context. */
  teamId?: string | null
  /** Server-resolved roles within the active org/team. */
  roles?: Role[]
  /** Flattened resolved scopes (union of role→scopes + explicit grants). */
  scopes: Scope[]
  /** If impersonation is active, who initiated it. */
  impersonatedBy?: string | null
}

/** Per-request auth context attached by guards/interceptors. */
export interface UserContext extends PrincipalSummary {
  /** Session identifier bound to issued tokens. */
  sessionId?: SessionId | string | null
  /** Current token id (jti) if present. */
  jti?: Jti | string | null
}

/** Convenience shape when augmenting request objects without importing Express. */
export interface AuthenticatedRequestLike {
  user?: UserContext
  headers?: Record<string, unknown>
  cookies?: Record<string, string>
}

/* ---------------------------------- MFA ----------------------------------- */

export type MfaMethod = 'totp' | 'webauthn' | 'sms' | 'recovery'

export interface MfaChallenge {
  /** Challenge id (state key in Redis/DB). */
  id: string
  /** Which method must be satisfied. */
  method: MfaMethod
  /** Opaque data needed by a verifier (e.g., WebAuthn challenge). */
  payload?: Record<string, unknown>
  /** Epoch seconds when this challenge expires. */
  expiresAt: number
}

/** Result returned when primary auth succeeds but MFA is still required. */
export interface MfaRequiredResult {
  mfaRequired: true
  methods: MfaMethod[]
  /** Client must present this on the next step. */
  stateId: string
}

/* --------------------------------- OAuth ---------------------------------- */

export type OAuthProvider = 'google' | 'github' | 'discord' | 'facebook'

export interface OAuthState {
  id: string // state id stored server-side
  provider: OAuthProvider
  nonce: string
  /** PKCE code verifier if using authorization_code + PKCE. */
  codeVerifier?: string
  /** Where to return users after successful callback. */
  redirectUri?: string
  createdAt: number // epoch seconds
}

export interface OAuthProfile {
  provider: OAuthProvider
  providerUserId: string
  email?: string | null
  emailVerified?: boolean
  name?: string | null
  avatarUrl?: string | null
}

/* ----------------------------- WebAuthn (lite) ---------------------------- */

/**
 * Minimal shapes to avoid importing @simplewebauthn types.
 * These are intentionally loose to keep this package lightweight.
 */
export interface WebAuthnRegistrationOptions {
  challenge: string
  rpId: string
  rpName: string
  userId: string
  userName: string
  timeout?: number
}

export interface WebAuthnAuthenticationOptions {
  challenge: string
  rpId: string
  timeout?: number
  allowCredentials?: Array<{ id: string; type: 'public-key' }>
}

/* --------------------------- Auth results / errors ------------------------- */

export interface AuthSuccess {
  ok: true
  principal: PrincipalSummary
  sessionId: SessionId | string
  tokens: TokenPair
  /** Raw decoded payloads (optional but helpful for debug/logging). */
  payloads?: {
    access?: AnyTokenPayload
    refresh?: AnyTokenPayload
  }
}

export type AuthResult = AuthSuccess | MfaRequiredResult

export type AuthErrorCode =
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_REVOKED'
  | 'INSUFFICIENT_SCOPE'
  | 'ORG_REQUIRED'
  | 'MFA_REQUIRED'
  | 'OAUTH_STATE_INVALID'
  | 'OAUTH_EXCHANGE_FAILED'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'

export interface AuthError {
  ok?: false
  code: AuthErrorCode
  message: string
  details?: Record<string, unknown>
}

/* ------------------------------ Misc helpers ------------------------------ */

/** Utility to coerce any scope representation into a normalized array. */
export type ScopeInput = Scope | Scope[] | ReadonlyArray<Scope>
