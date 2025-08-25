// libs/auth/src/lib/services/oauth/google.adapter.ts
// -----------------------------------------------------------------------------
// Google OAuth2 / OpenID Connect Adapter (PKCE + State + Profile Normalization)
// -----------------------------------------------------------------------------
// High-level overview
// • This adapter encapsulates a complete Google OAuth/OIDC flow for server-side apps.
// • It builds an authorization URL with PKCE + state, persists ephemeral data in Redis,
//   exchanges the returned authorization code for tokens, fetches a normalized user profile
//   from Google's OIDC userinfo endpoint, and offers a best‑effort token revocation method.
// • Every potentially tricky bit (PKCE, state storage, x-www-form-urlencoded vs JSON,
//   and optional query params) is annotated inline for clarity.

import { Injectable, Optional } from '@nestjs/common'
import { randomBytes, createHash } from 'node:crypto'

import type { CacheRepository, Seconds } from '@helixai/redis'
import type { AuditService } from '@helixai/audit'

// ─────────────────────────────────────────────────────────────────────────────
// Public types returned/accepted by the adapter
// ─────────────────────────────────────────────────────────────────────────────

/** A minimal, stable representation of the Google user. */
export interface GoogleProfile {
  id: string // OIDC "sub" — globally unique Google user id
  email: string | null
  emailVerified: boolean | null
  name: string | null
  givenName: string | null
  familyName: string | null
  picture: string | null
  locale: string | null
  rawUser: unknown // Keep the raw payload if callers need to inspect extra fields
  idToken?: string | null // Present if scope includes 'openid' and Google returns an ID token
}

/** Constructor/DI options; you can also rely on env vars (see constructor). */
export interface GoogleOAuthOptions {
  clientId: string
  clientSecret?: string // Optional for public clients; recommended for confidential server apps
  redirectUri: string
  scope?: string | string[] // Joined into a space-delimited string
  accessType?: 'online' | 'offline' // 'offline' to receive refresh_token
  prompt?: 'none' | 'consent' | 'select_account' // Consent behavior on the Google prompt
  includeGrantedScopes?: boolean // True means incremental auth
  loginHint?: string // Email or sub to pre-fill the Google account chooser
  hd?: string // Hosted domain restriction (e.g., 'example.com')
  ephemeralTtl?: Seconds // TTL for state/PKCE stash in Redis
  extraAuthParams?: Record<string, string | number | boolean | undefined>
}

/** Value returned to the caller for redirecting a browser. */
export interface GoogleAuthUrl {
  url: string // Complete authorize URL with query params
  state: string // Random anti-CSRF token we also persist server-side
  codeChallenge: string // PKCE S256 challenge (debugging/tests)
  codeVerifier: string // PKCE verifier (kept server-side; don't send to the browser in prod)
}

/** Simplified shape of Google token response. */
export interface GoogleTokenSet {
  accessToken: string
  tokenType: string
  refreshToken?: string
  idToken?: string
  scope?: string
  expiresIn?: number
  raw: unknown // Raw token response
}

/** Internal runtime configuration after merging DI options and env vars. */
type RuntimeOptions = {
  clientId: string
  clientSecret: string // May be empty string, but never undefined
  redirectUri: string
  scope: string // Always a space-delimited string by the time we use it
  accessType: 'online' | 'offline'
  prompt: 'none' | 'consent' | 'select_account' | '' // Empty string means omit param
  includeGrantedScopes: boolean
  loginHint: string // Empty string means omit param
  hd: string // Empty string means omit param
  ephemeralTtl: Seconds
  extraAuthParams: Record<string, string | number | boolean | undefined>
}

// ─────────────────────────────────────────────────────────────────────────────
// Low-level helpers (PKCE, scope normalization, endpoints, audit)
// ─────────────────────────────────────────────────────────────────────────────

/** Base64url encode a Buffer (RFC 7515) — remove padding and replace symbols. */
function b64url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

/** Generate a high-entropy, URL-safe random string. */
function randomUrlSafe(bytes = 32): string {
  return b64url(randomBytes(bytes))
}

/** PKCE S256 challenge derivation: challenge = base64url( SHA-256( verifier ) ). */
function pkceS256(verifier: string): string {
  const h = createHash('sha256').update(verifier).digest()
  return b64url(h)
}

/**
 * Normalize scopes into a single space-delimited string (Google accepts space).
 * We also tolerate comma-separated input and collapse repeated whitespace.
 */
function normalizeScopes(scope?: string | string[]): string | undefined {
  if (!scope) return undefined
  if (Array.isArray(scope)) return scope.join(' ')
  return scope.trim().replace(/,/g, ' ').replace(/\s+/g, ' ')
}

// OAuth/OIDC endpoints used by Google. If you ever need to support alternate
// roots (e.g., different environments), keep them centralized here.
const GOOGLE_ACCOUNTS = 'https://accounts.google.com'
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token'
const GOOGLE_REVOKE = 'https://oauth2.googleapis.com/revoke'
const GOOGLE_USERINFO = 'https://openidconnect.googleapis.com/v1/userinfo'
const ENDPOINTS = {
  authorize: `${GOOGLE_ACCOUNTS}/o/oauth2/v2/auth`,
  token: GOOGLE_TOKEN,
  revoke: GOOGLE_REVOKE,
  userinfo: GOOGLE_USERINFO
}

/** Namespaced Redis key for ephemeral state/PKCE record. */
const kState = (state: string) => `oauth:google:state:${state}`

// ─────────────── Audit helper ───────────────
// We don't want audit failures to affect auth. This thin wrapper calls the
// first supported method (emit/record/log) and swallows errors.

type AuditLike = {
  emit?(event: string, data?: any): unknown | Promise<unknown>
  record?(event: string, data?: any): unknown | Promise<unknown>
  log?(event: string, data?: any): unknown | Promise<unknown>
}
async function audit(
  a: AuditService | AuditLike | undefined,
  event: string,
  data?: any
) {
  if (!a) return
  try {
    const anyA: any = a
    if (typeof anyA.emit === 'function') await anyA.emit(event, data)
    else if (typeof anyA.record === 'function') await anyA.record(event, data)
    else if (typeof anyA.log === 'function') await anyA.log(event, data)
  } catch {
    // Intentionally ignore audit errors
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class GoogleOAuthAdapter {
  private readonly cfg: RuntimeOptions

  constructor(
    @Optional() private readonly cache?: CacheRepository,
    @Optional() private readonly auditSvc?: AuditService | AuditLike,
    opts?: Partial<GoogleOAuthOptions>
  ) {
    const env = process.env

    // Ensure we always have a concrete scope string available. Default covers
    // standard OIDC identity and email/profile details.
    const normalizedScope =
      normalizeScopes(opts?.scope ?? env.GOOGLE_OAUTH_SCOPE) ||
      'openid email profile'

    // Merge DI options with environment variables; coerce possibly-undefined
    // booleans/strings to concrete values so the rest of the class can treat
    // them as present/absent using simple checks.
    this.cfg = {
      clientId: opts?.clientId ?? env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: opts?.clientSecret ?? env.GOOGLE_CLIENT_SECRET ?? '',
      redirectUri: opts?.redirectUri ?? env.GOOGLE_REDIRECT_URI ?? '',
      scope: normalizedScope,
      accessType:
        opts?.accessType ??
        ((env.GOOGLE_OAUTH_ACCESS_TYPE as 'online' | 'offline') || 'offline'),
      prompt:
        opts?.prompt ??
        ((env.GOOGLE_OAUTH_PROMPT as 'none' | 'consent' | 'select_account') ||
          ''),
      includeGrantedScopes:
        opts?.includeGrantedScopes ??
        env.GOOGLE_INCLUDE_GRANTED_SCOPES != false,
      loginHint: opts?.loginHint ?? env.GOOGLE_LOGIN_HINT ?? '',
      hd: opts?.hd ?? env.GOOGLE_HD ?? '',
      ephemeralTtl: (opts?.ephemeralTtl ??
        Number(env.GOOGLE_STATE_TTL ?? 600)) as Seconds, // 10m default
      extraAuthParams: opts?.extraAuthParams ?? {}
    }

    // Fail fast if core config is missing. This produces a clear operational
    // error rather than an opaque redirect failure downstream.
    if (!this.cfg.clientId || !this.cfg.redirectUri) {
      throw new Error(
        'google_oauth_misconfigured: missing clientId or redirectUri'
      )
    }
  }

  // ───────────────────────── Authorization URL (PKCE + state) ─────────────────

  /**
   * Create a Google authorization URL and stash PKCE verifier + state in Redis.
   *
   * Why state? Protects against CSRF by binding the browser redirect to the
   * server-side stash. Why PKCE? Prevents code interception attacks by proving
   * the party that initiated auth is the one exchanging the code.
   */
  async buildAuthUrl(params?: {
    redirectUri?: string
    scope?: string | string[]
    accessType?: 'online' | 'offline'
    prompt?: 'none' | 'consent' | 'select_account'
    includeGrantedScopes?: boolean
    loginHint?: string
    hd?: string
    extra?: Record<string, string | number | boolean | undefined>
  }): Promise<GoogleAuthUrl> {
    // Generate cryptographically-strong state and PKCE values
    const state = randomUrlSafe(32)
    const codeVerifier = randomUrlSafe(64)
    const codeChallenge = pkceS256(codeVerifier)

    // Persist just enough info to validate the callback, with a tight TTL
    if (this.cache) {
      await this.cache.setJSON(
        kState(state),
        {
          codeVerifier,
          createdAt: new Date().toISOString(),
          redirectUri: params?.redirectUri ?? this.cfg.redirectUri // we record which redirectUri to validate against
        },
        this.cfg.ephemeralTtl
      )
    }

    // Build query per Google requirements
    const q = new URLSearchParams()
    q.set('client_id', this.cfg.clientId)
    q.set('redirect_uri', params?.redirectUri ?? this.cfg.redirectUri)
    q.set('response_type', 'code') // we use the authorization code flow

    // Scope — always a single space-delimited string
    const scope = normalizeScopes(params?.scope) ?? this.cfg.scope
    q.set('scope', scope)

    // Common Google knobs
    q.set('access_type', params?.accessType ?? this.cfg.accessType) // 'offline' to request refresh_token
    if (params?.prompt ?? this.cfg.prompt)
      q.set('prompt', params?.prompt ?? this.cfg.prompt)

    // Compute the boolean first to avoid any boolean-to-string confusion
    const includeGranted =
      (params?.includeGrantedScopes ?? this.cfg.includeGrantedScopes) === true
    if (includeGranted) q.set('include_granted_scopes', 'true')

    if (params?.loginHint ?? this.cfg.loginHint)
      q.set('login_hint', params?.loginHint ?? this.cfg.loginHint)
    if (params?.hd ?? this.cfg.hd) q.set('hd', params?.hd ?? this.cfg.hd)

    // PKCE additions (bind authorization to the verifier kept server-side)
    q.set('state', state)
    q.set('code_challenge', codeChallenge)
    q.set('code_challenge_method', 'S256')

    // Allow callers to pass through custom query params without forking code
    const extras = { ...this.cfg.extraAuthParams, ...(params?.extra ?? {}) }
    for (const [k, v] of Object.entries(extras)) {
      if (v === undefined || v === null) continue
      q.set(k, String(v))
    }

    const url = `${ENDPOINTS.authorize}?${q.toString()}`

    // Non-blocking telemetry
    await audit(this.auditSvc, 'auth.oauth.google.auth_url_built', {
      state,
      redirectUri: params?.redirectUri ?? this.cfg.redirectUri,
      hasCache: !!this.cache
    })

    return { url, state, codeChallenge, codeVerifier }
  }

  // ─────────────────────────── Code → Token exchange ──────────────────────────

  /**
   * Exchange an authorization code for tokens. Verifies state + PKCE via Redis.
   *
   * Implementation details:
   * • Google requires application/x-www-form-urlencoded for token requests.
   * • We delete the state stash on success *or* after read to prevent replay.
   */
  async exchangeCode(code: string, state: string): Promise<GoogleTokenSet> {
    // Load the PKCE verifier + redirectUri that we stashed during buildAuthUrl
    const stash = this.cache
      ? await this.cache.getJSON<{ codeVerifier: string; redirectUri: string }>(
          kState(state)
        )
      : null

    if (!stash?.codeVerifier) throw new Error('google_oauth_invalid_state')

    // Best-effort: remove used state to prevent replay attacks
    if (this.cache) await this.cache.del(kState(state)).catch(() => {})

    // Prepare form-encoded body as per Google's token endpoint expectations
    const body = new URLSearchParams()
    body.set('client_id', this.cfg.clientId)
    if (this.cfg.clientSecret) body.set('client_secret', this.cfg.clientSecret)
    body.set('grant_type', 'authorization_code')
    body.set('code', code)
    body.set('redirect_uri', stash.redirectUri || this.cfg.redirectUri)
    body.set('code_verifier', stash.codeVerifier) // PKCE binding

    const res = await fetch(ENDPOINTS.token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })

    if (!res.ok) {
      // Capture error details for observability; do not leak sensitive data
      const text = await res.text().catch(() => '')
      await audit(this.auditSvc, 'auth.oauth.google.exchange_failed', {
        state,
        status: res.status,
        text
      })
      throw new Error(`google_token_exchange_failed: ${res.status}`)
    }

    // Parse and extract the parts we care about; keep the raw object for callers
    const json: any = await res.json()
    const accessToken = json.access_token as string | undefined
    const tokenType = json.token_type as string | undefined
    const refreshToken = json.refresh_token as string | undefined
    const idToken = json.id_token as string | undefined
    const scope = typeof json.scope === 'string' ? json.scope : undefined
    const expiresIn =
      typeof json.expires_in === 'number' ? json.expires_in : undefined

    if (!accessToken) {
      await audit(this.auditSvc, 'auth.oauth.google.exchange_invalid', {
        state,
        json
      })
      throw new Error('google_token_exchange_missing_token')
    }

    await audit(this.auditSvc, 'auth.oauth.google.exchanged', {
      state,
      hasToken: true
    })

    return {
      accessToken,
      tokenType: tokenType ?? 'Bearer',
      refreshToken,
      idToken,
      scope,
      expiresIn,
      raw: json
    }
  }

  // ─────────────────────────────── User fetching ──────────────────────────────

  /** Build a standard Authorization header value. */
  asBearer(token: string): string {
    return `Bearer ${token}`
  }

  /**
   * Raw fetch to OIDC /userinfo. We pass a friendly UA and translate non-2xx
   * into a typed error with useful audit metadata.
   */
  private async fetchUserRaw(accessToken: string): Promise<any> {
    const res = await fetch(ENDPOINTS.userinfo, {
      headers: {
        Authorization: this.asBearer(accessToken),
        'User-Agent': 'HelixAI/1.0 (+auth)'
      }
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      await audit(this.auditSvc, 'auth.oauth.google.user_failed', {
        status: res.status,
        text
      })
      throw new Error(`google_user_fetch_failed: ${res.status}`)
    }
    return res.json()
  }

  /**
   * Fetch and normalize the Google user profile. The normalized shape is
   * designed to be stable and easy to use downstream, while still keeping the
   * raw payload available for edge cases.
   */
  async fetchUser(
    accessToken: string,
    idToken?: string | null
  ): Promise<GoogleProfile> {
    const user = await this.fetchUserRaw(accessToken)

    const profile: GoogleProfile = {
      id: user?.sub ? String(user.sub) : '',
      email: user?.email ? String(user.email) : null,
      emailVerified:
        typeof user?.email_verified === 'boolean'
          ? !!user.email_verified
          : null,
      name: user?.name ? String(user.name) : null,
      givenName: user?.given_name ? String(user.given_name) : null,
      familyName: user?.family_name ? String(user.family_name) : null,
      picture: user?.picture ? String(user.picture) : null,
      locale: user?.locale ? String(user.locale) : null,
      rawUser: user,
      idToken: idToken ?? null
    }

    await audit(this.auditSvc, 'auth.oauth.google.profile_fetched', {
      id: profile.id,
      hasEmail: !!profile.email,
      verified: profile.emailVerified ?? null
    })

    return profile
  }

  // ─────────────────────────────── Revocation (best-effort) ──────────────────

  /**
   * Revoke an access or refresh token. Google returns HTTP 200 on success.
   * This is best-effort and should not block logout flows.
   */
  async revokeToken(token: string): Promise<boolean> {
    const body = new URLSearchParams()
    body.set('token', token)

    const res = await fetch(ENDPOINTS.revoke, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })

    const ok = res.status === 200
    await audit(this.auditSvc, 'auth.oauth.google.revoked', {
      ok,
      status: res.status
    })
    return ok
  }
}
