// libs/auth/src/lib/services/oauth/discord.adapter.ts
// -----------------------------------------------------------------------------
// Discord OAuth2 Adapter (PKCE + State + Profile Normalization)
// -----------------------------------------------------------------------------
// What this provides
//   • buildAuthUrl(): create Discord authorization URL with PKCE (S256) + state
//     - Stores ephemeral { codeVerifier, redirectUri } in Redis (short TTL)
//   • exchangeCode(): trade code+state for access_token (validates PKCE)
//   • fetchUser(): call /users/@me (email if 'email' scope granted), normalize
//   • revokeToken(): best-effort token revocation
//
// Dependencies
//   • @helixai/redis: CacheRepository, Seconds
//   • @helixai/audit: AuditService (optional; non-blocking)
//   • Node >= 18 for global fetch
//
// Notes
//   • Discord expects space-delimited scopes in the `scope` query parameter.
//   • Token exchange uses application/x-www-form-urlencoded.
//   • PKCE: send code_verifier during exchange.
// -----------------------------------------------------------------------------

import { Injectable, Optional } from '@nestjs/common'
import { randomBytes, createHash } from 'node:crypto'

import type { CacheRepository, Seconds } from '@helixai/redis'
import type { AuditService } from '@helixai/audit'

// ─────────────────────────────── Types & options ─────────────────────────────

/** Minimal normalized Discord user profile returned to callers. */
export interface DiscordProfile {
  id: string
  username: string | null // user.username (not including discriminator)
  globalName: string | null // user.global_name (new display name)
  email: string | null // requires 'email' scope
  emailVerified: boolean | null // user.verified (email verified)
  avatarUrl: string | null
  rawUser: unknown // raw /users/@me
}

/** Adapter options (DI/env). */
export interface DiscordOAuthOptions {
  clientId: string
  clientSecret?: string // optional for public clients; recommended server-side
  redirectUri: string
  scope?: string | string[] // space-delimited or array (we normalize)
  prompt?: 'none' | 'consent' // Discord supports 'none' to skip prompt
  ephemeralTtl?: Seconds // Redis TTL for state/PKCE (default 10m)
  extraAuthParams?: Record<string, string | number | boolean | undefined>
}

/** Authorization URL result (hand to browser). */
export interface DiscordAuthUrl {
  url: string
  state: string
  codeChallenge: string
  // Note: do not expose codeVerifier to the browser in production.
  codeVerifier: string
}

/** Token response shape we return. */
export interface DiscordTokenSet {
  accessToken: string
  tokenType: string
  refreshToken?: string
  scope?: string
  expiresIn?: number
  raw: unknown
}

/** Fully-resolved runtime config (no undefined). */
type RuntimeOptions = {
  clientId: string
  clientSecret: string // may be '', but never undefined
  redirectUri: string
  scope: string // **always** a space-delimited string
  prompt: 'none' | 'consent' | '' // '' means omit param
  ephemeralTtl: Seconds
  extraAuthParams: Record<string, string | number | boolean | undefined>
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

/** Secure random URL-safe string. */
function randomUrlSafe(bytes = 32): string {
  return b64url(randomBytes(bytes))
}

/** PKCE S256 challenge derivation. */
function pkceS256(verifier: string): string {
  const h = createHash('sha256').update(verifier).digest()
  return b64url(h)
}

/** Normalize scopes to a space-delimited string (Discord expects space). */
function normalizeScopes(scope?: string | string[]): string | undefined {
  if (!scope) return undefined
  if (Array.isArray(scope)) return scope.join(' ')
  // Replace commas and collapse whitespace to single spaces
  return scope.trim().replace(/,/g, ' ').replace(/\s+/g, ' ')
}

/** Discord endpoints. */
const DISCORD_ROOT = 'https://discord.com'
const API = `${DISCORD_ROOT}/api`
const ENDPOINTS = {
  authorize: `${API}/oauth2/authorize`,
  token: `${API}/oauth2/token`,
  revoke: `${API}/oauth2/token/revoke`,
  me: `${API}/users/@me`
}

/** Redis key for ephemeral OAuth state/PKCE. */
const kState = (state: string) => `oauth:discord:state:${state}`

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
    // never throw from audit
  }
}

// ────────────────────────────────── Service ──────────────────────────────────

@Injectable()
export class DiscordOAuthAdapter {
  private readonly cfg: RuntimeOptions

  constructor(
    @Optional() private readonly cache?: CacheRepository,
    @Optional() private readonly auditSvc?: AuditService | AuditLike,
    opts?: Partial<DiscordOAuthOptions>
  ) {
    const env = process.env

    // Normalize scope to a space-delimited string; include 'identify' by default.
    const normalizedScope =
      normalizeScopes(opts?.scope ?? env.DISCORD_OAUTH_SCOPE) ||
      'identify email'

    this.cfg = {
      clientId: opts?.clientId ?? env.DISCORD_CLIENT_ID ?? '',
      clientSecret: opts?.clientSecret ?? env.DISCORD_CLIENT_SECRET ?? '',
      redirectUri: opts?.redirectUri ?? env.DISCORD_REDIRECT_URI ?? '',
      scope: normalizedScope,
      prompt:
        opts?.prompt ??
        (env.DISCORD_OAUTH_PROMPT as 'none' | 'consent' | undefined) ??
        '',
      ephemeralTtl: (opts?.ephemeralTtl ??
        Number(env.DISCORD_STATE_TTL ?? 600)) as Seconds, // 10m default
      extraAuthParams: opts?.extraAuthParams ?? {}
    }

    if (!this.cfg.clientId || !this.cfg.redirectUri) {
      throw new Error(
        'discord_oauth_misconfigured: missing clientId or redirectUri'
      )
    }
  }

  // ───────────────────────────── Authorization URL ───────────────────────────

  /**
   * Build a Discord authorization URL (with PKCE + state) and store the verifier
   * in Redis with a short TTL to validate the callback later.
   */
  async buildAuthUrl(params?: {
    redirectUri?: string
    scope?: string | string[]
    prompt?: 'none' | 'consent'
    extra?: Record<string, string | number | boolean | undefined>
  }): Promise<DiscordAuthUrl> {
    const state = randomUrlSafe(32)
    const codeVerifier = randomUrlSafe(64)
    const codeChallenge = pkceS256(codeVerifier)

    // Persist ephemeral verifier & metadata for later verification
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

    // Build query
    const q = new URLSearchParams()
    q.set('client_id', this.cfg.clientId)
    q.set('redirect_uri', params?.redirectUri ?? this.cfg.redirectUri)
    q.set('response_type', 'code')
    // Always a string after normalization
    q.set('scope', normalizeScopes(params?.scope) ?? this.cfg.scope)
    if (params?.prompt ?? this.cfg.prompt)
      q.set('prompt', params?.prompt ?? this.cfg.prompt)
    q.set('state', state)
    q.set('code_challenge', codeChallenge)
    q.set('code_challenge_method', 'S256')

    // Merge extra params (from ctor + call)
    const extras = { ...this.cfg.extraAuthParams, ...(params?.extra ?? {}) }
    for (const [k, v] of Object.entries(extras)) {
      if (v === undefined || v === null) continue
      q.set(k, String(v))
    }

    const url = `${ENDPOINTS.authorize}?${q.toString()}`

    await audit(this.auditSvc, 'auth.oauth.discord.auth_url_built', {
      state,
      redirectUri: params?.redirectUri ?? this.cfg.redirectUri,
      hasCache: !!this.cache
    })

    return { url, state, codeChallenge, codeVerifier }
  }

  // ─────────────────────────────── Token exchange ────────────────────────────

  /**
   * Exchange a Discord authorization code for an access token.
   * Validates state and PKCE verifier from Redis.
   */
  async exchangeCode(code: string, state: string): Promise<DiscordTokenSet> {
    // Load & clear ephemeral verifier
    const stash = this.cache
      ? await this.cache.getJSON<{ codeVerifier: string; redirectUri: string }>(
          kState(state)
        )
      : null

    if (!stash?.codeVerifier) throw new Error('discord_oauth_invalid_state')

    // Best-effort: remove used state to prevent replay
    if (this.cache) await this.cache.del(kState(state)).catch(() => {})

    // Discord expects x-www-form-urlencoded
    const body = new URLSearchParams()
    body.set('client_id', this.cfg.clientId)
    if (this.cfg.clientSecret) body.set('client_secret', this.cfg.clientSecret)
    body.set('grant_type', 'authorization_code')
    body.set('code', code)
    body.set('redirect_uri', stash.redirectUri || this.cfg.redirectUri)
    body.set('code_verifier', stash.codeVerifier)

    const res = await fetch(ENDPOINTS.token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      await audit(this.auditSvc, 'auth.oauth.discord.exchange_failed', {
        state,
        status: res.status,
        text
      })
      throw new Error(`discord_token_exchange_failed: ${res.status}`)
    }

    const json: any = await res.json()
    const accessToken = json.access_token as string | undefined
    const tokenType = json.token_type as string | undefined
    const refreshToken = json.refresh_token as string | undefined
    const scope = typeof json.scope === 'string' ? json.scope : undefined
    const expiresIn =
      typeof json.expires_in === 'number' ? json.expires_in : undefined

    if (!accessToken) {
      await audit(this.auditSvc, 'auth.oauth.discord.exchange_invalid', {
        state,
        json
      })
      throw new Error('discord_token_exchange_missing_token')
    }

    await audit(this.auditSvc, 'auth.oauth.discord.exchanged', {
      state,
      hasToken: true
    })

    return {
      accessToken,
      tokenType: tokenType ?? 'Bearer',
      refreshToken,
      scope,
      expiresIn,
      raw: json
    }
  }

  // ─────────────────────────────── Profile fetching ──────────────────────────

  /** Authorization header helper. */
  asBearer(token: string): string {
    return `Bearer ${token}`
  }

  /** Raw fetch to /users/@me; returns Discord user JSON. */
  private async fetchUserRaw(token: string): Promise<any> {
    const res = await fetch(ENDPOINTS.me, {
      headers: {
        Authorization: this.asBearer(token),
        'User-Agent': 'HelixAI/1.0 (+auth)'
      }
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      await audit(this.auditSvc, 'auth.oauth.discord.user_failed', {
        status: res.status,
        text
      })
      throw new Error(`discord_user_fetch_failed: ${res.status}`)
    }
    return res.json()
  }

  /**
   * Fetch & normalize a Discord profile using an access token.
   * Email is only present if the `email` scope was granted.
   */
  async fetchUser(accessToken: string): Promise<DiscordProfile> {
    const user = await this.fetchUserRaw(accessToken)

    // Email presence/verification
    const email: string | null = user?.email ? String(user.email) : null
    const emailVerified: boolean | null =
      typeof user?.verified === 'boolean' ? !!user.verified : null

    // Avatar URL: https://cdn.discordapp.com/avatars/{user.id}/{avatar}.png
    let avatarUrl: string | null = null
    if (user?.id && user?.avatar) {
      avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    }

    const profile: DiscordProfile = {
      id: String(user?.id ?? ''),
      username: user?.username ? String(user.username) : null,
      globalName: user?.global_name ? String(user.global_name) : null,
      email,
      emailVerified,
      avatarUrl,
      rawUser: user
    }

    await audit(this.auditSvc, 'auth.oauth.discord.profile_fetched', {
      id: profile.id,
      hasEmail: !!profile.email,
      verified: profile.emailVerified ?? null
    })

    return profile
  }

  // ─────────────────────────────── Revocation (best-effort) ──────────────────

  /**
   * Revoke an access token. Requires client credentials.
   * Note: Discord returns 200 on success.
   */
  async revokeToken(accessToken: string): Promise<boolean> {
    if (!this.cfg.clientSecret) return false

    const body = new URLSearchParams()
    body.set('client_id', this.cfg.clientId)
    body.set('client_secret', this.cfg.clientSecret)
    body.set('token', accessToken)

    const res = await fetch(ENDPOINTS.revoke, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })

    const ok = res.status === 200
    await audit(this.auditSvc, 'auth.oauth.discord.revoked', {
      ok,
      status: res.status
    })
    return ok
  }
}
