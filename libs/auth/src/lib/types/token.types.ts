// libs/auth/src/lib/types/token.types.ts

/**
 * Token / JWKS type definitions for the Auth library.
 * Keep this file free of runtime deps (no imports from 'jose' etc.).
 */

/** Nominal brand helper */
type Brand<T, U extends string> = T & { __brand: U }

/** Branded primitives for clarity in signatures */
export type JwtString = Brand<string, 'jwt'>
export type Jti = Brand<string, 'jti'>
export type Kid = Brand<string, 'kid'>
export type Subject = Brand<string, 'sub'> // typically userId
export type OrgId = Brand<string, 'org'>
export type SessionId = Brand<string, 'sid'>

/** Standard registered JWT claims (RFC 7519) */
export interface RegisteredJwtClaims {
  iss?: string // issuer
  sub?: Subject | string
  aud?: string | string[] // audience(s)
  exp?: number // epoch seconds
  nbf?: number // epoch seconds
  iat?: number // epoch seconds
  jti?: Jti | string // token id
}

/** Helix custom claims used across tokens */
export interface HelixCustomClaims {
  /** Space-delimited scope string OR array; either is accepted. */
  scope?: string | string[]
  /** Organization / tenant context (UUID string). */
  org?: OrgId | string
  /** Session identifier to tie AT/RT to a server-side session. */
  sid?: SessionId | string
  /** Token schema/version for forced rotation/logout strategies. */
  ver?: number
}

/** Kind discriminator to make payloads easy to narrow at call sites */
export type TokenKind = 'access' | 'refresh'

/** Base payload that both Access and Refresh share */
export interface BaseAuthTokenPayload
  extends RegisteredJwtClaims,
    HelixCustomClaims {
  /** Discriminator for narrowing; not part of RFC but useful internally. */
  typ: TokenKind
}

/** Access Token payload (short-lived) */
export interface AccessTokenPayload extends BaseAuthTokenPayload {
  typ: 'access'
}

/** Refresh Token payload (long-lived, rotates) */
export interface RefreshTokenPayload extends BaseAuthTokenPayload {
  typ: 'refresh'
  /**
   * Optional refresh-specific id separate from `jti` if you maintain
   * an RT lineage/family; some implementations just use `jti`.
   */
  rid?: string
}

/** Union for convenience when a function accepts either token */
export type AnyTokenPayload = AccessTokenPayload | RefreshTokenPayload

/** Minimal JWT header used by our signer/verifier */
export interface JwtHeader {
  alg: string // e.g., "RS256"
  kid?: Kid | string // key id
  typ?: 'JWT'
}

/** Shape of a decoded token before verification */
export interface DecodedJwt<
  TPayload extends RegisteredJwtClaims = AnyTokenPayload
> {
  header: JwtHeader
  payload: TPayload
  /**
   * Raw signature bytes base64url without dot prefix/suffix (optional).
   * Not always provided by decoders; included here for completeness.
   */
  signature?: string
}

/** Convenience struct returned by mint/rotate flows */
export interface TokenPair {
  accessToken: JwtString
  refreshToken: JwtString
}

/** Optional metadata alongside a minted token */
export interface TokenMeta {
  /** Epoch seconds */
  issuedAt: number
  /** Epoch seconds */
  expiresAt: number
  /** Calculated TTL seconds (expiresAt - issuedAt) */
  ttlSeconds: number
  /** Audience(s) the token was minted for */
  audience: string | string[]
}

/* ------------------------------- JWKS types ------------------------------- */

/** Minimal RSA public JWK used for publishing JWKS */
export interface RsaPublicJwk {
  kty: 'RSA'
  kid: Kid | string
  use?: 'sig' | 'enc'
  alg?: string // e.g., "RS256"
  n: string // base64url modulus
  e: string // base64url exponent
}

/** Allow room for EC/OKP if you later add them */
export interface EcPublicJwk {
  kty: 'EC'
  kid: Kid | string
  use?: 'sig' | 'enc'
  alg?: string // e.g., "ES256"
  crv: 'P-256' | 'P-384' | 'P-521' | string
  x: string
  y: string
}

export interface OkpPublicJwk {
  kty: 'OKP'
  kid: Kid | string
  use?: 'sig' | 'enc'
  alg?: string // e.g., "EdDSA"
  crv: 'Ed25519' | 'Ed448' | string
  x: string
}

export type PublicJwk = RsaPublicJwk | EcPublicJwk | OkpPublicJwk

export interface JwksDocument {
  keys: PublicJwk[]
}
