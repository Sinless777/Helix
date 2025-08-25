// libs/auth/src/lib/config/auth.config.ts

import { registerAs } from '@nestjs/config'
import { z } from 'zod'
import {
  JWT,
  COOKIES,
  JWKS_WELL_KNOWN_PATH,
  ENV,
  type SameSite,
  type CookieDefaults,
} from '../constants/auth.constants'

/** Parse helpers */
const toInt = (v: string | undefined, d: number) => {
  const n = v ? Number.parseInt(v, 10) : Number.NaN
  return Number.isFinite(n) ? n : d
}
const toBool = (v: string | undefined, d = false) => {
  if (v == null) return d
  const s = v.toLowerCase().trim()
  return s === '1' || s === 'true' || s === 'yes' || s === 'on'
}
const splitCsv = (v: string | undefined): string[] =>
  v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []

/** Cookie schema aligned with CookieDefaults */
const cookieSchema = z.object({
  name: z.string(),
  path: z.string().default('/'),
  httpOnly: z.boolean().default(true),
  secure: z.boolean().default(true),
  sameSite: z.custom<SameSite>().default('lax'),
  domain: z.string().optional(),
  maxAgeSeconds: z.number().int().positive().optional(),
})

/** Main config schema */
const schema = z.object({
  algorithm: z.string().default(JWT.ALG),
  issuer: z.string().default(JWT.ISSUER_DEFAULT),
  audience: z.string().default(JWT.AUDIENCE_DEFAULT),
  audiences: z.array(z.string()).default([]),
  clockSkewSeconds: z.number().int().nonnegative().default(JWT.CLOCK_SKEW_SECONDS),
  accessTtlSeconds: z.number().int().positive().default(JWT.ACCESS_TTL_SECONDS),
  refreshTtlSeconds: z.number().int().positive().default(JWT.REFRESH_TTL_SECONDS),
  refreshFamilyTtlSeconds: z
    .number()
    .int()
    .positive()
    .default(JWT.REFRESH_FAMILY_TTL_SECONDS),
  cookies: z.object({
    access: cookieSchema,
    refresh: cookieSchema,
    csrf: cookieSchema,
  }),
  jwks: z.object({
    /** Optional public base URL (e.g., https://api.example.com) */
    baseUrl: z.string().url().optional(),
    /** Well-known path (normally "/.well-known/jwks.json") */
    wellKnownPath: z.string().default(JWKS_WELL_KNOWN_PATH),
    /** RSA modulus length for generated keypairs */
    modulusLength: z.union([z.literal(2048), z.literal(3072), z.literal(4096)]).default(2048),
    /** Rotation cadence in whole days */
    rotationDays: z.number().int().positive().default(90),
  }),
})

export type AuthConfig = z.infer<typeof schema>

/**
 * Registered ConfigFactory:
 * - Reads env
 * - Applies defaults (secure cookies in prod)
 * - Validates via Zod
 */
export const authConfig = registerAs<AuthConfig>('auth', () => {
  const env = process.env
  const isProd = (env.NODE_ENV ?? 'development') === 'production'

  // Base cookie defaults (toggle secure by env)
  const baseCookie = (c: CookieDefaults): CookieDefaults => ({
    ...c,
    secure: toBool(env.AUTH_COOKIE_SECURE, isProd),
    domain: env.AUTH_COOKIE_DOMAIN || c.domain,
    sameSite: (env.AUTH_COOKIE_SAMESITE as SameSite) || c.sameSite,
  })

  const cfg: AuthConfig = {
    algorithm: env.AUTH_JWT_ALG || JWT.ALG,
    issuer: env[ENV.JWT_ISSUER] || JWT.ISSUER_DEFAULT,
    audience: env[ENV.JWT_AUDIENCE] || JWT.AUDIENCE_DEFAULT,
    audiences: splitCsv(env[ENV.JWT_AUDIENCES]),
    clockSkewSeconds: toInt(env.AUTH_JWT_CLOCK_SKEW, JWT.CLOCK_SKEW_SECONDS),
    accessTtlSeconds: toInt(env.AUTH_ACCESS_TTL, JWT.ACCESS_TTL_SECONDS),
    refreshTtlSeconds: toInt(env.AUTH_REFRESH_TTL, JWT.REFRESH_TTL_SECONDS),
    refreshFamilyTtlSeconds: toInt(
      env.AUTH_REFRESH_FAMILY_TTL,
      JWT.REFRESH_FAMILY_TTL_SECONDS
    ),
    cookies: {
      access: baseCookie({
        ...COOKIES.ACCESS,
        name: env.AUTH_COOKIE_ACCESS_NAME || COOKIES.ACCESS.name,
      }),
      refresh: baseCookie({
        ...COOKIES.REFRESH,
        name: env.AUTH_COOKIE_REFRESH_NAME || COOKIES.REFRESH.name,
        maxAgeSeconds:
          toInt(env.AUTH_COOKIE_REFRESH_MAXAGE, COOKIES.REFRESH.maxAgeSeconds ?? 0) ||
          COOKIES.REFRESH.maxAgeSeconds,
      }),
      csrf: baseCookie({
        ...COOKIES.CSRF,
        name: env.AUTH_COOKIE_CSRF_NAME || COOKIES.CSRF.name,
        httpOnly: toBool(env.AUTH_COOKIE_CSRF_HTTPONLY, COOKIES.CSRF.httpOnly),
      }),
    },
    jwks: {
      baseUrl: env[ENV.JWKS_BASE_URL],
      wellKnownPath: JWKS_WELL_KNOWN_PATH,
      modulusLength: toInt(env.AUTH_JWKS_MODULUS_LENGTH, 2048) as 2048 | 3072 | 4096,
      rotationDays: toInt(env[ENV.JWKS_ROTATION_DAYS], 90),
    },
  }

  // Validate + return
  return schema.parse(cfg)
})

/** Convenience accessor for the effective audiences (fallback to single audience). */
export const effectiveAudiences = (c: AuthConfig): string[] =>
  c.audiences.length ? c.audiences : [c.audience]
