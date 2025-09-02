// libs/core/src/lib/constants/types/auth.ts

import type { ApiResponse } from './api'

/** ---------- Core identity ---------- */

export type UserId = string
export type TeamId = string
export type SessionId = string
export type ProviderAccountId = string

/** Supported identity providers */
export type AuthProvider = 'discord' | 'google' | 'github' | 'email'

/** Project roles (scoped per team/org) */
export type Role = 'owner' | 'admin' | 'developer' | 'support' | 'viewer'

/** Free-form permission keys (RBAC can resolve these to booleans) */
export type Permission = string

export interface PermissionGrants {
  /** e.g., { "tickets.read": true, "tickets.write": false } */
  [permission: string]: boolean
}

/** Minimal user record usable across apps/services */
export interface User {
  id: UserId
  email?: string
  username?: string
  displayName?: string
  avatarUrl?: string
  createdAt?: string
  updatedAt?: string
  /** Map of provider -> provider account id */
  linkedProviders?: Partial<Record<AuthProvider, ProviderAccountId>>
  /** Optional global flags (suspended, staff, etc.) */
  flags?: Record<string, boolean | string | number>
}

/** Team / organization record */
export interface Team {
  id: TeamId
  name: string
  slug?: string
  createdAt?: string
  updatedAt?: string
  /** Optional billing tier metadata to align with Roadmap */
  billingTier?: 'free' | 'pro' | 'enterprise'
}

/** Relationship between a user and a team (scoped RBAC) */
export interface Membership {
  userId: UserId
  teamId: TeamId
  roles: Role[]
  permissions?: PermissionGrants
  createdAt?: string
  updatedAt?: string
}

/** ---------- Tokens, sessions, and JWT ---------- */

export interface TokenPair {
  accessToken: string
  /** Optional; present when refresh workflow is enabled */
  refreshToken?: string
  /** Unix seconds until expiry of the access token */
  expiresIn?: number
  /** ISO for when the access token expires (derived) */
  expiresAt?: string
}

/** Standardized JWT payload with common registered + custom claims */
export interface JWTPayload {
  /** Subject (user id) */
  sub: UserId
  /** Issuer */
  iss?: string
  /** Audience */
  aud?: string | string[]
  /** Expiration (Unix seconds) */
  exp?: number
  /** Issued at (Unix seconds) */
  iat?: number
  /** JWT ID */
  jti?: string

  /** Team context (active team id) */
  tid?: TeamId
  /** Roles granted within the active team */
  roles?: Role[]
  /** Optional coarse permissions hash/version for cache busting */
  permsVersion?: string
  /** Fine-grained permission booleans (optional) */
  perms?: PermissionGrants
}

/** Server-side session state (for cookie or DB-backed sessions) */
export interface Session {
  id: SessionId
  userId: UserId
  teamId?: TeamId
  createdAt: string
  updatedAt: string
  /** Session invalidation timestamp (if ended early) */
  revokedAt?: string
  /** Client hints / device info */
  userAgent?: string
  ip?: string
  /** Optional token snapshot for stateless auth */
  tokens?: TokenPair
}

/** ---------- MFA (2FA) ---------- */

export type MFAMethod = 'totp' | 'webauthn'

export interface MFAStatus {
  enabled: boolean
  methods: MFAMethod[]
  /** For TOTP provisioning (otpauth:// URI, base32 secret, etc.) */
  provisioning?: {
    type: 'totp'
    secretBase32?: string
    otpauthUrl?: string
    recoveryCodes?: string[]
  }
  /** For WebAuthn, registered credential descriptors (opaque to client) */
  webauthn?: {
    credentialIds?: string[]
  }
}

/** ---------- OAuth profiles ---------- */

export interface OAuthProfile {
  provider: AuthProvider
  providerAccountId: ProviderAccountId
  email?: string
  username?: string
  displayName?: string
  avatarUrl?: string
  raw?: unknown
}

/** ---------- Requests & Responses (API-shape) ---------- */

/** Email/password (or passkey placeholder) */
export interface EmailLoginRequest {
  provider: 'email'
  email: string
  password: string
  /** Optional MFA one-time code if user has MFA enabled */
  mfaCode?: string
  /** Optional requested team context */
  teamId?: TeamId
}

export interface OAuthStartRequest {
  provider: Exclude<AuthProvider, 'email'>
  /** Optional state for CSRF/return-to */
  state?: string
  /** Optional requested team context */
  teamId?: TeamId
}

export interface OAuthCallbackRequest {
  provider: Exclude<AuthProvider, 'email'>
  /** Code/verifier/etc. from the IdP */
  code?: string
  /** For PKCE */
  codeVerifier?: string
  /** For providers that return an ID token directly */
  idTokenHint?: string
  state?: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface LogoutRequest {
  sessionId?: SessionId
  /** If true, revoke all user sessions */
  allDevices?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  username?: string
  displayName?: string
  teamName?: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface EnableMFARequest {
  method: MFAMethod
}

export interface VerifyMFARequest {
  method: MFAMethod
  /** TOTP code or WebAuthn client data/attestation (opaque) */
  code?: string
  webauthnResponse?: unknown
}

/** ---------- API Response payloads ---------- */

export type LoginResponse = ApiResponse<{
  user: User
  team?: Team
  membership?: Membership
  session: Session
  tokens: TokenPair
  mfa?: MFAStatus
}>

export type OAuthStartResponse = ApiResponse<{
  authorizationUrl: string
  state?: string
}>

export type OAuthCallbackResponse = LoginResponse

export type RefreshTokenResponse = ApiResponse<{
  tokens: TokenPair
  session?: Session
}>

export type LogoutResponse = ApiResponse<{
  success: true
  revokedSessions?: number
}>

export type RegisterResponse = ApiResponse<{
  user: User
  emailVerificationRequired?: boolean
}>

export type VerifyEmailResponse = ApiResponse<{
  user: User
  verified: boolean
}>

export type MFAStatusResponse = ApiResponse<MFAStatus>
export type EnableMFAResponse = ApiResponse<MFAStatus>
export type VerifyMFAResponse = ApiResponse<MFAStatus>

/** ---------- RBAC helpers (types only) ---------- */

/** Optional static role → permissions mapping */
export interface RoleDefinition {
  role: Role
  inherits?: Role[]
  grants?: PermissionGrants
}

/** A compact RBAC model container (useful for seeding or caching) */
export interface RBACModel {
  roles: RoleDefinition[]
  /** Optional default grants applied to all authenticated users */
  baseline?: PermissionGrants
}

/** ---------- Audit trail ---------- */

export type AuthEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'REFRESH_SUCCESS'
  | 'REFRESH_FAILURE'
  | 'REGISTER'
  | 'VERIFY_EMAIL'
  | 'MFA_ENABLE'
  | 'MFA_VERIFY'
  | 'LINK_PROVIDER'
  | 'UNLINK_PROVIDER'

export interface AuthAuditEvent {
  id: string
  type: AuthEventType
  userId?: UserId
  teamId?: TeamId
  sessionId?: SessionId
  provider?: AuthProvider
  ip?: string
  userAgent?: string
  /** ISO timestamp */
  at: string
  /** Structured event details (never log secrets) */
  details?: Record<string, unknown>
}
