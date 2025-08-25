// libs/auth/src/lib/services/oauth/github.adapter.ts
// -----------------------------------------------------------------------------
// GitHub OAuth Adapter (PKCE + State + Profile Normalization)
// -----------------------------------------------------------------------------
// Fixes applied:
//  • scope / enterpriseBaseUrl in runtime cfg are never undefined
//  • audit calls go through a safe helper (supports emit|record|log)
//  • 'client_secret' set via bracket notation to satisfy TS index signature
// -----------------------------------------------------------------------------

import { Injectable, Optional } from '@nestjs/common'
import { randomBytes, createHash } from 'node:crypto'

import type { CacheRepository, Seconds } from '@helixai/redis'
import type { AuditService } from '@helixai/audit'

// ─────────────────────────────── Types & options ─────────────────────────────

/** Minimal normalized GitHub user shape we return to callers. */
export interface GitHubProfile {
  id: string
  username: string | null
  name: string | null
  email: string | null
  emailVerified: boolean | null
  avatarUrl: string | null
  rawUser: unknown
  rawEmails?: unknown
}

/** Runtime config for this adapter (DI/env). */
export interface GitHubOAuthOptions {
  clientId: string
  clientSecret?: string
  redirectUri: string
  /** GitHub accepts comma or space-separated scopes. */
  scope?: string | string[]
  /** Allow signup on GitHub’s consent screen (default: true). */
  allowSignup?: boolean
  /** Enterprise base URL (e.g., 'https://github.example.com'). */
  enterpriseBaseUrl?: string
  /** State/PKCE TTL in Redis (seconds). */
  ephemeralTtl?: Seconds
  /** Extra auth params (e.g., login hint). */
  extraAuthParams?: Record<string, string | number | boolean | undefined>
}

export interface GitHubAuthUrl {
  url: string
  state: string
  codeChallenge: string
  // Note: we DO NOT return the verifier to the browser in prod flows.
  codeVerifier: string
}

export interface GitHubTokenSet {
  accessToken: string
  tokenType: string
  scope?: string
  raw: unknown
}

// Internal, fully-resolved runtime config (no undefined).
type RuntimeOptions = {
  clientId: string
  clientSecret: string // may be empty, but never undefined
  redirectUri: string
  scope: string | string[] // guaranteed string or string[]
  allowSignup: boolean
  enterpriseBaseUrl: string // '' for github.com default
  ephemeralTtl: Seconds
  extraAuthParams: Record<string, string | number | boolean | undefined>
}

// ─────────────────────────────── Internal helpers ─────────────────────────────

function b64url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}
function randomUrlSafe(bytes = 32): string {
  return b64url(randomBytes(bytes))
}
function pkceS256(verifier: string): string {
  const h = createHash('sha256').update(verifier).digest()
  return b64url(h)
}
/** Normalize to a single space-delimited string for GitHub. */
function normalizeScopes(scope?: string | string[]): string | undefined {
  if (!scope) return undefined
  if (Array.isArray(scope)) return scope.join(' ')
  return scope.trim().replace(/,/g, ' ').replace(/\s+/g, ' ')
}

/** Compose endpoints (supports GitHub Enterprise). */
function endpoints(base?: string) {
  const root = base?.trim() ? base.replace(/\/+$/, '') : 'https://github.com'
  const api =
    root === 'https://github.com' ? 'https://api.github.com' : `${root}/api/v3`
  return {
    authorize: `${root}/login/oauth/authorize`,
    token: `${root}/login/oauth/access_token`,
    user: `${api}/user`,
    emails: `${api}/user/emails`,
    revoke: (clientId: string) => `${api}/applications/${clientId}/grant`
  }
}

/** Redis keys for ephemeral OAuth state/PKCE. */
const kState = (state: string) => `oauth:github:state:${state}`

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
export class GitHubOAuthAdapter {
  private readonly cfg: RuntimeOptions

  constructor(
    @Optional() private readonly cache?: CacheRepository,
    @Optional() private readonly auditSvc?: AuditService | AuditLike,
    opts?: Partial<GitHubOAuthOptions>
  ) {
    const env = process.env

    // Ensure scope is *always* a string (fallback to common defaults).
    const normalizedScope =
      normalizeScopes(opts?.scope ?? env.GITHUB_OAUTH_SCOPE) ||
      'read:user user:email'

    this.cfg = {
      clientId: opts?.clientId ?? env.GITHUB_CLIENT_ID ?? '',
      clientSecret: opts?.clientSecret ?? env.GITHUB_CLIENT_SECRET ?? '',
      redirectUri: opts?.redirectUri ?? env.GITHUB_REDIRECT_URI ?? '',
      scope: normalizedScope,
      allowSignup: opts?.allowSignup ?? true,
      // Make enterpriseBaseUrl a string ('' means use github.com)
      enterpriseBaseUrl:
        opts?.enterpriseBaseUrl ?? env.GITHUB_ENTERPRISE_BASE_URL ?? '',
      ephemeralTtl: (opts?.ephemeralTtl ??
        Number(env.GITHUB_STATE_TTL ?? 600)) as Seconds, // 10m default
      extraAuthParams: opts?.extraAuthParams ?? {}
    }

    if (!this.cfg.clientId || !this.cfg.redirectUri) {
      throw new Error(
        'github_oauth_misconfigured: missing clientId or redirectUri'
      )
    }
  }

  // ───────────────────────────── Authorization URL ───────────────────────────

  /**
   * Build a GitHub authorization URL (with PKCE + state) and store the verifier
   * in Redis with a short TTL to validate the callback later.
   */
  async buildAuthUrl(params?: {
    redirectUri?: string
    scope?: string | string[]
    allowSignup?: boolean
    login?: string
    prompt?: 'consent' | 'none'
    extra?: Record<string, string | number | boolean | undefined>
  }): Promise<GitHubAuthUrl> {
    const eps = endpoints(this.cfg.enterpriseBaseUrl)

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

    const q = new URLSearchParams()
    q.set('client_id', this.cfg.clientId)
    q.set('redirect_uri', params?.redirectUri ?? this.cfg.redirectUri)

    const scope = normalizeScopes(
      params?.scope ?? (this.cfg.scope as string | string[])
    )
    if (scope) q.set('scope', scope)

    if (params?.allowSignup ?? this.cfg.allowSignup)
      q.set('allow_signup', 'true')
    if (params?.login) q.set('login', params.login)
    if (params?.prompt) q.set('prompt', params.prompt)
    q.set('state', state)
    q.set('code_challenge', codeChallenge)
    q.set('code_challenge_method', 'S256')

    // Merge extra params (from ctor + call)
    const extras = { ...this.cfg.extraAuthParams, ...(params?.extra ?? {}) }
    for (const [k, v] of Object.entries(extras)) {
      if (v === undefined || v === null) continue
      q.set(k, String(v))
    }

    const url = `${eps.authorize}?${q.toString()}`

    // Non-blocking audit
    await audit(this.auditSvc, 'auth.oauth.github.auth_url_built', {
      state,
      redirectUri: params?.redirectUri ?? this.cfg.redirectUri,
      hasCache: !!this.cache,
      enterprise: !!this.cfg.enterpriseBaseUrl
    })

    return { url, state, codeChallenge, codeVerifier }
  }

  // ─────────────────────────────── Token exchange ────────────────────────────

  /**
   * Exchange a GitHub authorization code for an access token.
   * Validates state and PKCE verifier from Redis.
   */
  async exchangeCode(code: string, state: string): Promise<GitHubTokenSet> {
    const eps = endpoints(this.cfg.enterpriseBaseUrl)

    // Load & clear ephemeral verifier
    const stash = this.cache
      ? await this.cache.getJSON<{ codeVerifier: string; redirectUri: string }>(
          kState(state)
        )
      : null

    if (!stash?.codeVerifier) throw new Error('github_oauth_invalid_state')

    // Best-effort: remove used state to prevent replay
    if (this.cache) await this.cache.del(kState(state)).catch(() => {})

    // GitHub accepts JSON with Accept: application/json
    const body: Record<string, string> = {
      client_id: this.cfg.clientId,
      code,
      redirect_uri: stash.redirectUri || this.cfg.redirectUri,
      code_verifier: stash.codeVerifier // PKCE
    }
    if (this.cfg.clientSecret) body['client_secret'] = this.cfg.clientSecret

    const res = await fetch(eps.token, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      await audit(this.auditSvc, 'auth.oauth.github.exchange_failed', {
        state,
        status: res.status,
        text
      })
      throw new Error(`github_token_exchange_failed: ${res.status}`)
    }

    const json: any = await res.json()
    const accessToken = json.access_token as string | undefined
    const tokenType = json.token_type as string | undefined
    const scope = typeof json.scope === 'string' ? json.scope : undefined

    if (!accessToken) {
      await audit(this.auditSvc, 'auth.oauth.github.exchange_invalid', {
        state,
        json
      })
      throw new Error('github_token_exchange_missing_token')
    }

    await audit(this.auditSvc, 'auth.oauth.github.exchanged', {
      state,
      hasToken: true
    })

    return { accessToken, tokenType: tokenType ?? 'bearer', scope, raw: json }
  }

  // ─────────────────────────────── Profile fetching ──────────────────────────

  asBearer(token: string): string {
    return `Bearer ${token}`
  }

  private async fetchUserRaw(token: string): Promise<any> {
    const eps = endpoints(this.cfg.enterpriseBaseUrl)
    const res = await fetch(eps.user, {
      headers: {
        Authorization: this.asBearer(token),
        Accept: 'application/vnd.github+json'
      }
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      await audit(this.auditSvc, 'auth.oauth.github.user_failed', {
        status: res.status,
        text
      })
      throw new Error(`github_user_fetch_failed: ${res.status}`)
    }
    return res.json()
  }

  private async fetchEmailsRaw(token: string): Promise<any[]> {
    const eps = endpoints(this.cfg.enterpriseBaseUrl)
    const res = await fetch(eps.emails, {
      headers: {
        Authorization: this.asBearer(token),
        Accept: 'application/vnd.github+json'
      }
    })
    if (!res.ok) {
      // emails are optional for some flows; return empty array on failure
      return []
    }
    const arr = await res.json()
    return Array.isArray(arr) ? arr : []
  }

  /** Fetch & normalize a GitHub profile using an access token. */
  async fetchUser(accessToken: string): Promise<GitHubProfile> {
    const [user, emails] = await Promise.all([
      this.fetchUserRaw(accessToken),
      this.fetchEmailsRaw(accessToken)
    ])

    // Prefer primary verified email; fallback to first verified; else null.
    let email: string | null = null
    let emailVerified: boolean | null = null
    if (Array.isArray(emails) && emails.length > 0) {
      const primary = emails.find((e: any) => e?.primary === true)
      const verified = emails.find((e: any) => e?.verified === true)
      const chosen = primary ?? verified ?? emails[0]
      email = (chosen?.email && String(chosen.email)) || null
      emailVerified =
        chosen?.verified === true ? true : primary ? !!primary.verified : null
    }

    const profile: GitHubProfile = {
      id: String(user?.id ?? ''),
      username: user?.login ? String(user.login) : null,
      name: user?.name ? String(user.name) : null,
      email,
      emailVerified,
      avatarUrl: user?.avatar_url ? String(user.avatar_url) : null,
      rawUser: user,
      rawEmails: emails
    }

    await audit(this.auditSvc, 'auth.oauth.github.profile_fetched', {
      id: profile.id,
      hasEmail: !!profile.email,
      verified: profile.emailVerified ?? null
    })

    return profile
  }

  // ─────────────────────────────── Revocation (best-effort) ──────────────────

  /**
   * Revoke a token (best-effort). Requires Basic auth with clientId:clientSecret.
   * NOTE: GitHub.com vs Enterprise behavior can differ; treat as best-effort.
   */
  async revokeToken(accessToken: string): Promise<boolean> {
    if (!this.cfg.clientSecret) return false
    const eps = endpoints(this.cfg.enterpriseBaseUrl)

    const basic = Buffer.from(
      `${this.cfg.clientId}:${this.cfg.clientSecret}`
    ).toString('base64')
    const res = await fetch(eps.revoke(this.cfg.clientId), {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${basic}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ access_token: accessToken })
    })

    const ok = res.status === 204 || res.status === 200
    await audit(this.auditSvc, 'auth.oauth.github.revoked', {
      ok,
      status: res.status
    })
    return ok
  }
}
