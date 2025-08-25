// libs/auth/src/lib/strategies/jwt.strategy.ts
// -----------------------------------------------------------------------------
// Passport "JWT" Strategy (custom)
// -----------------------------------------------------------------------------
// Why a custom strategy?
//   We already have a verifier service that knows how to validate and decode
//   access tokens (signatures, issuer/audience, exp/nbf, denylist, etc.).
//   Instead of configuring `passport-jwt` with keys/parsers, we plug our
//   verifier directly into Passport via `passport-custom` and keep all the
//   crypto & policy logic in one place.
//
// What this strategy does:
//   • Extracts an access token from Authorization: Bearer <jwt> or an access cookie
//   • Delegates verification to your injected AccessTokenVerifier
//   • Ensures the verified token is an ACCESS token (not refresh)
//   • Returns a typed `UserContext` → Passport attaches it to `req.user`
//
// Usage (HTTP):
//   @UseGuards(AuthGuard('jwt'))
//   getProfile(@Req() req) { return req.user }
//
// Usage (GraphQL):
//   Create a small guard wrapper:
//     export class GqlJwtAuthGuard extends AuthGuard('jwt') {
//       getRequest(ctx: ExecutionContext) {
//         const { GqlExecutionContext } = require('@nestjs/graphql')
//         const gql = GqlExecutionContext.create(ctx)
//         return gql.getContext().req
//       }
//     }
//
// DI wiring (in your AuthModule):
//   providers: [
//     TokenService,
//     { provide: AUTH_TOKEN_VERIFIER, useExisting: TokenService },
//     JwtStrategy,
//   ]
//
// Dependencies:
//   pnpm add @nestjs/passport passport-custom
// -----------------------------------------------------------------------------

import {
  Injectable,
  Inject,
  Optional,
  UnauthorizedException
} from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy as CustomStrategy } from 'passport-custom'

import { COOKIES, HEADER } from '../constants/auth.constants'
import {
  AUTH_TOKEN_VERIFIER,
  type AccessTokenVerifier
} from '../guards/jwt-auth.guard'

import type { UserContext, Scope } from '../types/auth.types'
import type {
  AccessTokenPayload,
  JwtString,
  Jti,
  Subject
} from '../types/token.types'

/* -----------------------------------------------------------------------------
 * Token extraction helpers
 * -------------------------------------------------------------------------- */

/** Coerce unknown header value → first non-empty string (headers can be arrays). */
function asHeaderString(v: unknown): string | undefined {
  if (v == null) return undefined
  const s = Array.isArray(v) ? (v[0] ?? '') : String(v)
  const trimmed = String(s).trim()
  return trimmed.length ? trimmed : undefined
}

/** Extract a Bearer token from the Authorization header (case-insensitive). */
function extractBearerFromHeaders(
  headers: Record<string, unknown>
): JwtString | undefined {
  const raw =
    asHeaderString(headers['authorization']) ??
    asHeaderString((headers as any)['Authorization'])
  if (!raw) return undefined
  const prefix = 'bearer '
  if (raw.toLowerCase().startsWith(prefix)) {
    return raw.slice(prefix.length).trim() as JwtString
  }
  return undefined
}

/** Pull access token either from Authorization header or the access cookie. */
function getAccessTokenFromRequest(req: any): JwtString | undefined {
  // 1) Authorization: Bearer <jwt>
  const fromAuth = extractBearerFromHeaders(
    (req?.headers ?? {}) as Record<string, unknown>
  )
  if (fromAuth) return fromAuth

  // 2) Access cookie (HTTP-only recommended in browsers)
  const cookieName = COOKIES.ACCESS.name
  const fromCookie = req?.cookies?.[cookieName]
  if (typeof fromCookie === 'string' && fromCookie.trim()) {
    return fromCookie.trim() as JwtString
  }

  return undefined
}

/* -----------------------------------------------------------------------------
 * Scope normalization with type safety (matches ScopesGuard / JwtAuthGuard)
 * -------------------------------------------------------------------------- */

const SCOPE_RESOURCES = [
  'org',
  'users',
  'teams',
  'keys',
  'sessions',
  'webauthn',
  'mfa',
  'audit',
  'featureflags'
] as const
const SCOPE_ACTIONS = ['read', 'write', 'manage'] as const

/** Narrow an arbitrary string to the `Scope` template-literal union when valid. */
function isScopeString(s: string): s is Scope {
  const dot = s.indexOf('.')
  if (dot <= 0 || dot === s.length - 1) return false
  const resource = s.slice(0, dot)
  const action = s.slice(dot + 1)
  return (
    (SCOPE_RESOURCES as readonly string[]).includes(resource) &&
    (SCOPE_ACTIONS as readonly string[]).includes(action)
  )
}

/** Normalize any `scope` representation into a strongly typed `Scope[]`. */
function normalizeScopes(scope: string | string[] | undefined): Scope[] {
  const raw: string[] = !scope
    ? []
    : Array.isArray(scope)
      ? scope
      : scope.split(' ')
  return raw
    .map((s) => s.trim())
    .filter(Boolean)
    .filter(isScopeString)
}

/* -----------------------------------------------------------------------------
 * Strategy
 * -------------------------------------------------------------------------- */

@Injectable()
export class JwtStrategy extends PassportStrategy(CustomStrategy, 'jwt') {
  constructor(
    @Optional()
    @Inject(AUTH_TOKEN_VERIFIER)
    private readonly verifier?: AccessTokenVerifier
  ) {
    // CustomStrategy takes no constructor options; validate() gets the req
    super()
  }

  /**
   * validate(req):
   *   Passport calls this for each request guarded by AuthGuard('jwt').
   *   Return value becomes `req.user`. Throw UnauthorizedException to deny.
   */
  async validate(req: any): Promise<UserContext> {
    // Ensure a verifier is wired; this provides a clearer error than a null-ref.
    if (!this.verifier?.verifyAccess) {
      throw new UnauthorizedException('Access token verifier is not configured')
    }

    // Extract token (header or cookie)
    const token = getAccessTokenFromRequest(req)
    if (!token) {
      throw new UnauthorizedException('Missing access token')
    }

    // Verify and decode via your service (jose / cache / denylist checks happen there)
    let payload: AccessTokenPayload
    try {
      payload = await this.verifier.verifyAccess(token)
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }

    // Ensure it's an ACCESS token (defense-in-depth)
    if (payload.typ !== 'access') {
      throw new UnauthorizedException('Token type not allowed')
    }

    // Build a lightweight principal (can be hydrated later by another layer)
    const user: UserContext = {
      id: (payload.sub as Subject) ?? '',
      email: undefined,
      displayName: undefined,
      orgId: (payload.org as string | undefined) ?? undefined,
      teamId: undefined,
      roles: undefined, // your RBAC guard can populate roles later
      scopes: normalizeScopes(payload.scope),
      sessionId: (payload.sid as string | undefined) ?? null,
      jti: (payload.jti as Jti | string | undefined) ?? null
    }

    // Optional: propagate a request id for logs/telemetry if provided
    const reqId =
      asHeaderString(req.headers?.[HEADER.REQUEST_ID]) ??
      asHeaderString(req.headers?.['x-request-id'])
    if (reqId) {
      req.requestId = reqId
    }

    // Returning a value from validate() sets req.user
    return user
  }
}
