// libs/auth/src/lib/services/helpers/claims.helper.ts
// -----------------------------------------------------------------------------
// Claims helper for token minting
// -----------------------------------------------------------------------------
// What this module provides
//   • Utilities to build Registered JWT claims (iss, sub, aud, iat, exp, nbf, jti)
//   • Builders for access & refresh payloads with Helix custom claims
//   • Normalizers for scopes (array/string) and audience (string/array)
// Design goals
//   • No runtime deps (no jose). Keep this file portable & testable.
//   • Keep policy decisions (TTLs, clock skew, audience/issuer strings) outside;
//     callers pass them in from config.
//   • Return payloads that match the types in ../types/*.ts

import { randomUUID } from 'node:crypto'

import type {
  RegisteredJwtClaims,
  AccessTokenPayload,
  RefreshTokenPayload,
  Subject,
  Jti
} from '../../types/token.types'
import type { Scope } from '../../types/auth.types'

/* -----------------------------------------------------------------------------
 * Small helpers (pure, well-typed)
 * -------------------------------------------------------------------------- */

/** Convert a Date or epoch‐seconds/epoch‐millis into epoch seconds. */
export function toEpochSeconds(input?: Date | number): number {
  if (input == null) return Math.floor(Date.now() / 1000)
  if (input instanceof Date) return Math.floor(input.getTime() / 1000)
  // If the caller passed milliseconds, downscale to seconds (heuristic).
  return input > 1e12 ? Math.floor(input / 1000) : Math.floor(input)
}

/**
 * Convert a value or a (readonly) array into a plain mutable array (`T[]`).
 *
 * Why overloads?
 *   Narrowing a generic `ReadonlyArray<T> | T` with `Array.isArray` can leave TS
 *   unsure whether `v` is still a readonly array in the "else" branch. The
 *   overload signatures tell the compiler precisely what we return for each
 *   input shape, and the single implementation uses a safe cast.
 */
// Overload signatures (what callers see)
function toArray<T>(v: ReadonlyArray<T>): T[]
function toArray<T>(v: T): T[]
function toArray<T>(): T[]
// Implementation (single body)
function toArray<T>(v?: ReadonlyArray<T> | T): T[] {
  if (v == null) return []
  // `as any` here avoids the generic narrowing trap; the return type is governed
  // by the overloads above, so callers still get strong typing.
  return (Array.isArray(v) ? [...(v as ReadonlyArray<T>)] : [v as T]) as T[]
}

/** Shallow dedupe (by identity for objects, by value for primitives). */
function unique<T>(arr: T[]): T[] {
  if (arr.length <= 1) return arr
  return Array.from(new Set<T>(arr))
}

/**
 * Normalize audience:
 *  - Keep a single audience as a string (compact JWT)
 *  - Keep multiple audiences as a string[]
 */
export function normalizeAudience(
  aud?: string | string[] | ReadonlyArray<string>
): string | string[] | undefined {
  const arr = toArray(aud as string | string[] | undefined)
    .flatMap((s) => (Array.isArray(s) ? s : [s]))
    .map((s) => String(s).trim())
    .filter(Boolean)
  if (arr.length === 0) return undefined
  return arr.length === 1 ? arr[0] : arr
}

/**
 * Normalize scopes to a **space-delimited string** (OAuth2/JWT convention).
 * Accepts:
 *   • string              → used as-is
 *   • string[]/Scope[]    → joined with spaces
 *   • Scope               → coerced to string
 */
export function scopesToString(
  scopes?:
    | string
    | Scope
    | Array<string | Scope>
    | ReadonlyArray<string | Scope>
): string | undefined {
  if (scopes == null) return undefined
  if (typeof scopes === 'string') {
    const s = scopes.trim()
    return s.length ? s : undefined
  }
  const arr = unique(
    toArray<string | Scope>(scopes)
      .map((s) => String(s).trim())
      .filter(Boolean)
  )
  return arr.length ? arr.join(' ') : undefined
}

/** Generate a JTI (token id) using randomUUID. */
export function makeJti(): Jti {
  return randomUUID() as Jti
}

/** Option bag used by both access & refresh base claim builders. */
export interface BaseClaimOptions {
  subject: Subject | string
  issuer?: string
  audience?: string | string[]
  /** TTL for the token, in seconds (required). */
  ttlSeconds: number
  /**
   * Not-before skew (seconds). If provided and > 0, we set `nbf = iat - skew`
   * which gives verifiers room to account for clock drift while still
   * communicating intended validity start around "now".
   */
  clockSkewSeconds?: number
  /** Optional override for iat (epoch seconds). Defaults to now. */
  issuedAtSeconds?: number
  /** Optional override for jti (token id). Defaults to randomUUID(). */
  jti?: Jti | string
}

/**
 * Build the Registered JWT claims:
 *  - iat (now or provided)
 *  - exp (iat + ttl)
 *  - nbf (iat - clockSkewSeconds), when clockSkewSeconds > 0
 *  - iss / aud (normalized)
 *  - sub / jti
 */
export function buildRegisteredClaims(
  opts: BaseClaimOptions
): RegisteredJwtClaims {
  const iat = toEpochSeconds(opts.issuedAtSeconds)
  const exp = iat + Math.max(0, Math.floor(opts.ttlSeconds))
  const nbf =
    opts.clockSkewSeconds && opts.clockSkewSeconds > 0
      ? iat - Math.floor(opts.clockSkewSeconds)
      : undefined

  const claims: RegisteredJwtClaims = {
    iss: opts.issuer,
    sub: opts.subject as string,
    aud: normalizeAudience(opts.audience),
    iat,
    exp,
    nbf,
    jti: (opts.jti ?? makeJti()) as string
  }

  // Strip undefined fields to keep payload compact
  if (claims.iss == null) delete claims.iss
  if (claims.aud == null) delete claims.aud
  if (claims.nbf == null) delete claims.nbf

  return claims
}

/* -----------------------------------------------------------------------------
 * Access token payload builder
 * -------------------------------------------------------------------------- */

export interface AccessClaimsOptions extends BaseClaimOptions {
  /** Scopes to embed (space-delimited when serialized). */
  scopes?: string | Scope | Array<string | Scope>
  /** Active organization / tenant context (UUID string). */
  orgId?: string
  /** Server-side session id this token belongs to. */
  sessionId?: string
  /** Custom schema version to aid forced rotation strategies. */
  version?: number
}

/**
 * Build an AccessTokenPayload with custom Helix claims.
 * Note:
 *  - `typ` is set to 'access' (used by guards)
 *  - `scope` is space-delimited string (OAuth2 convention)
 *  - `org` and `sid` are custom app claims
 */
export function buildAccessPayload(
  opts: AccessClaimsOptions
): AccessTokenPayload {
  const reg = buildRegisteredClaims(opts)

  const payload: AccessTokenPayload = {
    ...reg,
    typ: 'access',
    scope: scopesToString(opts.scopes),
    org: opts.orgId,
    sid: opts.sessionId,
    ver: opts.version
  }

  // Remove undefined optional custom fields for compactness
  if (payload.scope == null) delete (payload as any).scope
  if (payload.org == null) delete (payload as any).org
  if (payload.sid == null) delete (payload as any).sid
  if (payload.ver == null) delete (payload as any).ver

  return payload
}

/* -----------------------------------------------------------------------------
 * Refresh token payload builder
 * -------------------------------------------------------------------------- */

export interface RefreshClaimsOptions extends BaseClaimOptions {
  /** Active organization / tenant context (UUID string). */
  orgId?: string
  /** Server-side session id this token belongs to. */
  sessionId?: string
  /** Separate refresh id if you distinguish `rid` from `jti`. */
  refreshId?: string
  /** Custom schema/version to aid forced rotation strategies. */
  version?: number
}

/**
 * Build a RefreshTokenPayload:
 *  - `typ` is 'refresh'
 *  - `rid` (optional) lets you track an RT lineage independent of `jti`
 *  - `org` and `sid` mirror the access token for correlation
 */
export function buildRefreshPayload(
  opts: RefreshClaimsOptions
): RefreshTokenPayload {
  const reg = buildRegisteredClaims(opts)

  const payload: RefreshTokenPayload = {
    ...reg,
    typ: 'refresh',
    org: opts.orgId,
    sid: opts.sessionId,
    ver: opts.version,
    rid: opts.refreshId // optional
  }

  if (payload.org == null) delete (payload as any).org
  if (payload.sid == null) delete (payload as any).sid
  if (payload.ver == null) delete (payload as any).ver
  if (payload.rid == null) delete (payload as any).rid

  return payload
}

/* -----------------------------------------------------------------------------
 * Convenience: tiny façade that returns both payload + meta timing
 * -------------------------------------------------------------------------- */

export interface WithMeta<T> {
  payload: T
  meta: {
    issuedAt: number
    expiresAt: number
    ttlSeconds: number
  }
}

/**
 * Mint access + meta in one call. Useful if your signer needs both payload and
 * timing info (for cookie Max-Age, logs, etc.).
 */
export function mintAccessWithMeta(
  opts: AccessClaimsOptions
): WithMeta<AccessTokenPayload> {
  const iat = toEpochSeconds(opts.issuedAtSeconds)
  const payload = buildAccessPayload({ ...opts, issuedAtSeconds: iat })
  const ttl = Math.max(0, Math.floor(opts.ttlSeconds))
  return {
    payload,
    meta: { issuedAt: payload.iat!, expiresAt: payload.exp!, ttlSeconds: ttl }
  }
}

/** Same as above, for refresh tokens. */
export function mintRefreshWithMeta(
  opts: RefreshClaimsOptions
): WithMeta<RefreshTokenPayload> {
  const iat = toEpochSeconds(opts.issuedAtSeconds)
  const payload = buildRefreshPayload({ ...opts, issuedAtSeconds: iat })
  const ttl = Math.max(0, Math.floor(opts.ttlSeconds))
  return {
    payload,
    meta: { issuedAt: payload.iat!, expiresAt: payload.exp!, ttlSeconds: ttl }
  }
}
