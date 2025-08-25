/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'test' | 'production'

    // ── JWT / tokens ───────────────────────────────────────────────────────────
    // JWS/JWT algorithm (HS* = shared secret; RS*/ES*/EdDSA = asymmetric).
    AUTH_JWT_ALG?:
      | 'HS256'
      | 'HS384'
      | 'HS512'
      | 'RS256'
      | 'RS384'
      | 'RS512'
      | 'ES256'
      | 'ES384'
      | 'EdDSA'
      | string

    // Clock tolerance (seconds) applied during verification.
    AUTH_JWT_CLOCK_SKEW?: `${number}`

    // Token TTLs in seconds.
    AUTH_ACCESS_TTL?: `${number}`
    AUTH_REFRESH_TTL?: `${number}`
    AUTH_REFRESH_FAMILY_TTL?: `${number}`

    // Issuer / audience (use AUDIENCES for multiple, comma-delimited).
    AUTH_JWT_ISSUER?: string
    AUTH_JWT_AUDIENCE?: string
    AUTH_JWT_AUDIENCES?: string // comma-separated list

    // Optional fixed KID to attach to JWT headers (useful without JWKS).
    AUTH_JWT_KID?: string

    // ── Signing / verification keys (used by TokenService) ────────────────────
    // HS* shared secret (TokenService falls back to JWT_SECRET if unset).
    AUTH_JWT_SECRET?: string
    JWT_SECRET?: string

    // RS*/ES*/EdDSA PEMs
    // - Private key in PKCS#8 PEM for signing (jose.importPKCS8).
    AUTH_PRIVATE_KEY_PEM?: string
    // - Public key in SPKI PEM for verification (jose.importSPKI).
    AUTH_PUBLIC_KEY_PEM?: string

    // ── JWKS (if you fetch/rotate keys via a JWKS endpoint) ───────────────────
    AUTH_JWKS_BASE_URL?: string // e.g., https://api.example.com
    AUTH_JWKS_MODULUS_LENGTH?: '2048' | '3072' | '4096' | `${number}`
    AUTH_JWKS_ROTATION_DAYS?: `${number}`

    // ── Cookies ───────────────────────────────────────────────────────────────
    AUTH_COOKIE_DOMAIN?: string
    AUTH_COOKIE_SECURE?: 'true' | 'false' | '1' | '0'
    AUTH_COOKIE_SAMESITE?: 'lax' | 'strict' | 'none'
    AUTH_COOKIE_ACCESS_NAME?: string
    AUTH_COOKIE_REFRESH_NAME?: string
    AUTH_COOKIE_REFRESH_MAXAGE?: `${number}`
    AUTH_COOKIE_CSRF_NAME?: string
    AUTH_COOKIE_CSRF_HTTPONLY?: 'true' | 'false' | '1' | '0'

    // ── GitHub OAuth ──────────────────────────────────────────────────────────
    GITHUB_CLIENT_ID?: string
    GITHUB_CLIENT_SECRET?: string
    GITHUB_REDIRECT_URI?: string
    GITHUB_ENTERPRISE_BASE_URL?: string // optional GH Enterprise root
    GITHUB_OAUTH_SCOPE?: string // space- or comma-delimited
    GITHUB_STATE_TTL?: `${number}` // seconds

    // ── Discord OAuth ─────────────────────────────────────────────────────────
    DISCORD_CLIENT_ID?: string
    DISCORD_CLIENT_SECRET?: string
    DISCORD_REDIRECT_URI?: string
    DISCORD_OAUTH_SCOPE?: string // space-delimited
    DISCORD_STATE_TTL?: `${number}` // seconds
    DISCORD_OAUTH_PROMPT?: 'none' | 'consent'

    // ── Google OAuth (OIDC) ───────────────────────────────────────────────────
    GOOGLE_CLIENT_ID?: string
    GOOGLE_CLIENT_SECRET?: string
    GOOGLE_REDIRECT_URI?: string
    GOOGLE_OAUTH_SCOPE?: string // space-delimited (e.g., "openid email profile")
    GOOGLE_STATE_TTL?: `${number}` // seconds
    GOOGLE_OAUTH_ACCESS_TYPE?: 'online' | 'offline'
    GOOGLE_OAUTH_PROMPT?: 'none' | 'consent' | 'select_account'
    GOOGLE_INCLUDE_GRANTED_SCOPES?: 'true' | 'false' | '1' | '0'
    GOOGLE_LOGIN_HINT?: string // email or sub
    GOOGLE_HD?: string // hosted domain restriction
    // Optional: alternate way to provide scopes as a comma list (adapter normalizes).
    GOOGLE_OAUTH_GRANTED_SCOPES?: string // comma-delimited list (optional)

    // ── Facebook OAuth ────────────────────────────────────────────────────────
    FACEBOOK_CLIENT_ID?: string
    FACEBOOK_CLIENT_SECRET?: string
    FACEBOOK_REDIRECT_URI?: string
    FACEBOOK_OAUTH_SCOPE?: string // comma-delimited (e.g., "public_profile,email")
    FACEBOOK_STATE_TTL?: `${number}` // seconds
    FACEBOOK_API_VERSION?: string // e.g., "v19.0"
    FACEBOOK_OAUTH_DISPLAY?: 'page' | 'popup' | 'touch' | 'wap'
    FACEBOOK_OAUTH_AUTH_TYPE?: 'rerequest' | 'reauthenticate'
    FACEBOOK_USER_FIELDS?: string // comma-delimited fields for /me

    // ── WebAuthn ──────────────────────────────────────────────────────────────
    // Relying Party display name (shown on device).
    WEBAUTHN_RP_NAME?: string
    // RP ID must be a registrable domain suffix of your allowed origins.
    WEBAUTHN_RP_ID?: string
    // Single origin (convenience for local dev) — e.g., "http://localhost:3000".
    WEBAUTHN_ORIGIN?: string
    // Multiple origins (comma-delimited) — e.g., "https://app.example.com,https://admin.example.com".
    WEBAUTHN_ORIGINS?: string
    // Client timeout (ms) for WebAuthn operations.
    WEBAUTHN_TIMEOUT_MS?: `${number}`
    // Require resident keys (discoverable credentials) at registration.
    WEBAUTHN_REQUIRE_RESIDENT_KEY?: 'true' | 'false' | '1' | '0'
    // User verification policy.
    WEBAUTHN_USER_VERIFICATION?: 'required' | 'preferred' | 'discouraged'
    // Challenge TTL (seconds) for registration/authentication.
    WEBAUTHN_CHALLENGE_TTL?: `${number}`
  }
}
