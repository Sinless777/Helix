// libs/auth/src/lib/services/oauth/facebook.adapter.ts
// -----------------------------------------------------------------------------
// Facebook OAuth2 Adapter (PKCE + State + Graph API profile normalization)
// -----------------------------------------------------------------------------
// What this provides
// • buildAuthUrl(): constructs the /dialog/oauth URL with PKCE (S256) + state
//   - Stashes { codeVerifier, redirectUri } in Redis for short TTL
// • exchangeCode(): trades code+state for an access token (validates PKCE)
// • fetchUser(): resolves /me?fields=... and normalizes a stable profile shape
// • revokeToken(): best-effort revocation via DELETE /me/permissions
//
// Design notes
// • PKCE: Facebook supports PKCE; we include code_challenge/code_verifier.
// • Scopes: Facebook traditionally uses comma-delimited scopes. We normalize to
//   a comma-separated string to align with their expectations.
// • All runtime config fields are fully resolved (no undefined), keeping TS happy.
// • Audit calls are non-blocking through a safe helper (emit|record|log).
// -----------------------------------------------------------------------------

import { Injectable, Optional } from '@nestjs/common'
import { randomBytes, createHash } from 'node:crypto'

import type { CacheRepository, Seconds } from '@helixai/redis'
import type { AuditService } from '@helixai/audit'

// ─────────────────────────────── Types & options ─────────────────────────────

/** Minimal normalized Facebook user profile we return to callers. */
export interface FacebookProfile {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  /** Facebook does not reliably expose email verification state → null. */
  emailVerified: boolean | null
  pictureUrl: string | null
  rawUser: unknown // raw /me payload
}

/** Adapter options (DI/env). */
export interface FacebookOAuthOptions {
  clientId: string // aka App ID
  clientSecret?: string // recommended for server-side exchange
  redirectUri: string
  scope?: string | string[] // we normalize to comma-delimited
  apiVersion?: string // e.g., 'v19.0' (defaults included)
  display?: 'page' | 'popup' | 'touch' | 'wap'
  /** Facebook “prompt”-ish behavior lives in auth_type: rerequest/reauthenticate */
  authType?: 'rerequest' | 'reauthenticate'
  ephemeralTtl?: Seconds // Redis TTL for state/PKCE (default 10m)
  extraAuthParams?: Record<string, string | number | boolean | undefined>
  /** Fields to fetch from /me; override if you need more. */
  userFields?: string | string[]
}

/** Authorization URL result (hand to browser/redirect). */
export interface FacebookAuthUrl {
  url: string
  state: string
  codeChallenge: string
  // Do not leak verifier to browser in production; kept here for tests/dev.
  codeVerifier: string
}

/** Token response we return. */
export interface FacebookTokenSet {
  accessToken: string
  tokenType: string
  expiresIn?: number
  raw: unknown
}

/** Fully-resolved runtime config (no undefined). */
type RuntimeOptions = {
  clientId: string
  clientSecret: string // may be '', but never undefined
  redirectUri: string
  scope: string // comma-delimited string
  apiVersion: string // e.g., 'v19.0'
  display: '' | 'page' | 'popup' | 'touch' | 'wap'
  authType: '' | 'rerequest' | 'reauthenticate'
  ephemeralTtl: Seconds
  extraAuthParams: Record<string, string | number | boolean | undefined>
  userFields: string // comma-delimited fields for /me
}

// ─────────────────────────────── Internal helpers ─────────────────────────────

/** Base64url encode a Buffer (no padding). */
function b64url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

/** Strong random, URL-safe string for state/verifier. */
function randomUrlSafe(bytes = 32): string {
  return b64url(randomBytes(bytes))
}

/** PKCE S256 challenge: base64url( SHA-256(verifier) ). */
function pkceS256(verifier: string): string {
  const h = createHash('sha256').update(verifier).digest()
  return b64url(h)
}

/** Normalize scopes to a **comma-delimited** string per Facebook convention. */
function normalizeScopesComma(scope?: string | string[]): string | undefined {
  if (!scope) return undefined
  if (Array.isArray(scope)) return scope.join(',')
  // Tolerate either commas or whitespace and emit a single comma-separated list
  return scope
    .trim()
    .replace(/\s+/g, ',')
    .replace(/,+/g, ',')
    .replace(/^,|,$/g, '')
}

/** Normalize user fields to a comma-delimited string. */
function normalizeFields(fields?: string | string[]): string | undefined {
  if (!fields) return undefined
  if (Array.isArray(fields)) return fields.join(',')
  return fields
    .trim()
    .replace(/\s+/g, ',')
    .replace(/,+/g, ',')
    .replace(/^,|,$/g, '')
}

/** Build Graph endpoints for a given API version. */
function endpoints(version: string) {
  const base = `https://www.facebook.com/${version}`
  const graph = `https://graph.facebook.com/${version}`
  return {
    authorize: `${base}/dialog/oauth`,
    token: `${graph}/oauth/access_token`,
    me: `${graph}/me`,
    // Revocation: DELETE /me/permissions (with user access token)
    revoke: `${graph}/me/permissions`
  }
}

/** Redis key for ephemeral OAuth state/PKCE. */
const kState = (state: string) => `oauth:facebook:state:${state}`

// ─────────────────────────────── Audit helper (safe) ─────────────────────────

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
    // Never throw from audit
  }
}

// ────────────────────────────────── Service ──────────────────────────────────

@Injectable()
export class FacebookOAuthAdapter {
  private readonly cfg: RuntimeOptions

  constructor(
    @Optional() private readonly cache?: CacheRepository,
    @Optional() private readonly auditSvc?: AuditService | AuditLike,
    opts?: Partial<FacebookOAuthOptions>
  ) {
    const env = process.env

    // Default scopes: public_profile + email (email requires review in some cases)
    const normalizedScope =
      normalizeScopesComma(opts?.scope ?? env.FACEBOOK_OAUTH_SCOPE) ||
      'public_profile,email'

    const normalizedFields =
      normalizeFields(opts?.userFields ?? env.FACEBOOK_USER_FIELDS) ||
      // A sensible default field set for many apps
      'id,name,first_name,last_name,email,picture'

    this.cfg = {
      clientId: opts?.clientId ?? env.FACEBOOK_CLIENT_ID ?? '',
      clientSecret: opts?.clientSecret ?? env.FACEBOOK_CLIENT_SECRET ?? '',
      redirectUri: opts?.redirectUri ?? env.FACEBOOK_REDIRECT_URI ?? '',
      scope: normalizedScope,
      apiVersion: opts?.apiVersion ?? env.FACEBOOK_API_VERSION ?? 'v19.0',
      display: opts?.display ?? (env.FACEBOOK_OAUTH_DISPLAY as any) ?? '',
      authType: opts?.authType ?? (env.FACEBOOK_OAUTH_AUTH_TYPE as any) ?? '',
      ephemeralTtl: (opts?.ephemeralTtl ??
        Number(env.FACEBOOK_STATE_TTL ?? 600)) as Seconds, // 10m
      extraAuthParams: opts?.extraAuthParams ?? {},
      userFields: normalizedFields
    }

    if (!this.cfg.clientId || !this.cfg.redirectUri) {
      throw new Error(
        'facebook_oauth_misconfigured: missing clientId or redirectUri'
      )
    }
  }

  // ───────────────────────────── Authorization URL ───────────────────────────

  /**
   * Build a Facebook authorization URL (with PKCE + state) and store the verifier
   * in Redis with a short TTL to validate the callback later.
   */
  async buildAuthUrl(params?: {
    redirectUri?: string
    scope?: string | string[]
    display?: 'page' | 'popup' | 'touch' | 'wap'
    authType?: 'rerequest' | 'reauthenticate'
    extra?: Record<string, string | number | boolean | undefined>
  }): Promise<FacebookAuthUrl> {
    const eps = endpoints(this.cfg.apiVersion)

    // Generate state + PKCE values
    const state = randomUrlSafe(32)
    const codeVerifier = randomUrlSafe(64)
    const codeChallenge = pkceS256(codeVerifier)

    // Persist verifier + redirectUri for later validation
    if (this.cache) {
      await this.cache.setJSON(
        kState(state),
        {
          codeVerifier,
          createdAt: new Date().toISOString(),
          redirectUri: params?.redirectUri ?? this.cfg.redirectUri
        },
        this.cfg.ephemeralTtl
      )
    }

    // Compose query
    const q = new URLSearchParams()
    q.set('client_id', this.cfg.clientId)
    q.set('redirect_uri', params?.redirectUri ?? this.cfg.redirectUri)
    q.set('response_type', 'code')

    const scope = normalizeScopesComma(params?.scope) ?? this.cfg.scope
    if (scope) q.set('scope', scope)

    if (params?.display ?? this.cfg.display)
      q.set('display', (params?.display ?? this.cfg.display) as string)
    if (params?.authType ?? this.cfg.authType)
      q.set('auth_type', (params?.authType ?? this.cfg.authType) as string)

    // PKCE
    q.set('state', state)
    q.set('code_challenge', codeChallenge)
    q.set('code_challenge_method', 'S256')

    // Merge extras
    const extras = { ...this.cfg.extraAuthParams, ...(params?.extra ?? {}) }
    for (const [k, v] of Object.entries(extras)) {
      if (v === undefined || v === null) continue
      q.set(k, String(v))
    }

    const url = `${eps.authorize}?${q.toString()}`

    await audit(this.auditSvc, 'auth.oauth.facebook.auth_url_built', {
      state,
      redirectUri: params?.redirectUri ?? this.cfg.redirectUri,
      hasCache: !!this.cache,
      version: this.cfg.apiVersion
    })

    return { url, state, codeChallenge, codeVerifier }
  }

  // ─────────────────────────────── Token exchange ────────────────────────────

  /**
   * Exchange a Facebook authorization code for an access token.
   * Validates state and PKCE verifier from Redis.
   */
  async exchangeCode(code: string, state: string): Promise<FacebookTokenSet> {
    const eps = endpoints(this.cfg.apiVersion)

    // Load & clear ephemeral verifier
    const stash = this.cache
      ? await this.cache.getJSON<{ codeVerifier: string; redirectUri: string }>(
          kState(state)
        )
      : null

    if (!stash?.codeVerifier) throw new Error('facebook_oauth_invalid_state')

    // Best-effort: remove used state to prevent replay
    if (this.cache) await this.cache.del(kState(state))

    // Facebook token exchange expects query/form params. We'll POST form-encoded.
    const body = new URLSearchParams()
    body.set('client_id', this.cfg.clientId)
    if (this.cfg.clientSecret) body.set('client_secret', this.cfg.clientSecret)
    body.set('redirect_uri', stash.redirectUri || this.cfg.redirectUri)
    body.set('code', code)
    // PKCE verifier binds this exchange to our original challenge
    body.set('code_verifier', stash.codeVerifier)

    const res = await fetch(eps.token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      await audit(this.auditSvc, 'auth.oauth.facebook.exchange_failed', {
        state,
        status: res.status,
        text
      })
      throw new Error(`facebook_token_exchange_failed: ${res.status}`)
    }

    const json: any = await res.json()
    const accessToken = json.access_token as string | undefined
    const tokenType = json.token_type as string | undefined
    const expiresIn =
      typeof json.expires_in === 'number' ? json.expires_in : undefined

    if (!accessToken) {
      await audit(this.auditSvc, 'auth.oauth.facebook.exchange_invalid', {
        state,
        json
      })
      throw new Error('facebook_token_exchange_missing_token')
    }

    await audit(this.auditSvc, 'auth.oauth.facebook.exchanged', {
      state,
      hasToken: true
    })

    return {
      accessToken,
      tokenType: tokenType ?? 'Bearer',
      expiresIn,
      raw: json
    }
  }

  // ─────────────────────────────── Profile fetching ──────────────────────────

  /** Build a standard Authorization header value (Graph also accepts access_token query). */
  asBearer(token: string): string {
    return `Bearer ${token}`
  }

  /** Fetch user JSON from /me?fields=... using Graph API. */
  private async fetchUserRaw(accessToken: string): Promise<any> {
    const eps = endpoints(this.cfg.apiVersion)
    // Fields are baked into config; callers can override via ctor options.
    const url = new URL(eps.me)
    url.searchParams.set('fields', this.cfg.userFields)

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: this.asBearer(accessToken),
        'User-Agent': 'HelixAI/1.0 (+auth)'
      }
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      await audit(this.auditSvc, 'auth.oauth.facebook.user_failed', {
        status: res.status,
        text
      })
      throw new Error(`facebook_user_fetch_failed: ${res.status}`)
    }
    return res.json()
  }

  /**
   * Fetch & normalize a Facebook profile using an access token.
   * Note: Facebook does not reliably expose email verification status.
   */
  async fetchUser(accessToken: string): Promise<FacebookProfile> {
    const user = await this.fetchUserRaw(accessToken)

    // Picture may come nested: picture.data.url
    let pictureUrl: string | null = null
    const pic = user?.picture
    if (
      pic &&
      typeof pic === 'object' &&
      pic.data &&
      typeof pic.data === 'object'
    ) {
      const u = (pic as any).data?.url
      if (u) pictureUrl = String(u)
    }

    const profile: FacebookProfile = {
      id: user?.id ? String(user.id) : '',
      name: user?.name ? String(user.name) : null,
      firstName: user?.first_name ? String(user.first_name) : null,
      lastName: user?.last_name ? String(user.last_name) : null,
      email: user?.email ? String(user.email) : null,
      emailVerified: null, // Graph API doesn't guarantee an email_verified boolean
      pictureUrl,
      rawUser: user
    }

    await audit(this.auditSvc, 'auth.oauth.facebook.profile_fetched', {
      id: profile.id,
      hasEmail: !!profile.email
    })

    return profile
  }

  // ─────────────────────────────── Revocation (best-effort) ──────────────────

  /**
   * Revoke a user access token by deleting all granted permissions.
   * Facebook responds with { success: true } on success.
   */
  async revokeToken(accessToken: string): Promise<boolean> {
    const eps = endpoints(this.cfg.apiVersion)
    const res = await fetch(eps.revoke, {
      method: 'DELETE',
      headers: {
        Authorization: this.asBearer(accessToken),
        'User-Agent': 'HelixAI/1.0 (+auth)'
      }
    })

    const ok = res.ok
    await audit(this.auditSvc, 'auth.oauth.facebook.revoked', {
      ok,
      status: res.status
    })
    return ok
  }
}
