// libs/auth/src/lib/guards/jwt-auth.guard.ts
// -----------------------------------------------------------------------------
// JWT Access Guard
// -----------------------------------------------------------------------------
// What this guard does:
//  1) Extracts an access token from Authorization header (Bearer) OR access cookie
//  2) Verifies the token using an injected verifier (keeps crypto concerns out)
//  3) Ensures it's an *access* token (not refresh)
//  4) Hydrates a lightweight `req.user` context for downstream handlers/guards
//  5) Works with both HTTP and (optionally) GraphQL without hard-coding deps
//
// Why the type changes:
//  Your `UserContext.scopes` expects a strongly-typed `Scope[]` (e.g. "users.read"),
//  not a `string[]`. We add a tiny runtime/type guard that validates and *narrows*
//  strings to the `Scope` template-literal union so TypeScript is satisfied.

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Optional,
  Inject,
  UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { HEADER, COOKIES } from '../constants/auth.constants'

// Token + auth types (kept runtime-dependency free)
import type {
  AccessTokenPayload,
  JwtString,
  Jti,
  Subject
} from '../types/token.types'
import type { UserContext, Scope } from '../types/auth.types'

/* -----------------------------------------------------------------------------
 * Verifier injection contract
 * -----------------------------------------------------------------------------
 * The guard depends on a minimal verifier interface instead of a concrete class.
 * In your module, bind your TokenService (or similar) to this token:
 *
 *  providers: [
 *    TokenService,
 *    { provide: AUTH_TOKEN_VERIFIER, useExisting: TokenService },
 *  ]
 *
 * Your service must implement `verifyAccess(jwt)` and return the verified payload.
 */

export interface AccessTokenVerifier {
  verifyAccess(jwt: string): Promise<AccessTokenPayload>
}

/** DI token for the access-token verifier implementation. */
export const AUTH_TOKEN_VERIFIER = Symbol('AUTH_TOKEN_VERIFIER')

/* -----------------------------------------------------------------------------
 * Request helpers (HTTP + optional GraphQL)
 * -------------------------------------------------------------------------- */

/** Obtain a Request-like object from either HTTP or GraphQL execution context. */
function getRequest(ctx: ExecutionContext): any | undefined {
  // HTTP pathway (most common)
  if (ctx.getType() === 'http') {
    return ctx.switchToHttp().getRequest()
  }
  // GraphQL pathway (lazy require so we don't create a hard dependency)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GqlExecutionContext } = require('@nestjs/graphql')
    const gql = GqlExecutionContext.create(ctx)
    return gql.getContext()?.req
  } catch {
    // @nestjs/graphql not installed — safe to ignore
  }
  return undefined
}

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
 * Scope normalization with type safety (fixes TS2322)
 * -------------------------------------------------------------------------- */
// We accept space-delimited scopes or an array from the JWT payload (`scope` claim).
// At runtime we validate each candidate string and only keep valid "resource.action"
// items (e.g., "users.read") so TypeScript can treat the result as `Scope[]`.

// Allowed resources + actions (must match your union in auth.types.ts)
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
  // Fast path: must look like "a.b"
  const dot = s.indexOf('.')
  if (dot <= 0 || dot === s.length - 1) return false
  const resource = s.slice(0, dot)
  const action = s.slice(dot + 1)
  // Validate both halves against the allowed vocabularies
  return (
    (SCOPE_RESOURCES as readonly string[]).includes(resource) &&
    (SCOPE_ACTIONS as readonly string[]).includes(action)
  )
}

/** Normalize any `scope` representation into a strongly typed `Scope[]`. */
function normalizeScopes(scope: string | string[] | undefined): Scope[] {
  // Convert to a string array (split space-delimited form if necessary)
  const raw: string[] = !scope
    ? []
    : Array.isArray(scope)
      ? scope
      : scope.split(' ')

  // Trim, drop empties, and keep only valid items using the type guard
  const clean = raw
    .map((s) => s.trim())
    .filter(Boolean)
    .filter(isScopeString)

  // At this point `clean` is inferred as `Scope[]` thanks to the type guard
  return clean
}

/* -----------------------------------------------------------------------------
 * Guard implementation
 * -------------------------------------------------------------------------- */

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Optional()
    @Inject(AUTH_TOKEN_VERIFIER)
    private readonly verifier?: AccessTokenVerifier
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Resolve a request-like object for either HTTP or GraphQL
    const req = getRequest(context)
    if (!req) {
      // Shouldn't occur in conventional Nest setups, but be explicit.
      throw new UnauthorizedException('Unable to resolve request context')
    }

    // Pull token from Authorization header or cookie
    const token = getAccessTokenFromRequest(req)
    if (!token) {
      throw new UnauthorizedException('Missing access token')
    }

    // Ensure a verifier has been wired up in the module
    if (!this.verifier?.verifyAccess) {
      // Clearer than a null reference error
      throw new UnauthorizedException('Access token verifier is not configured')
    }

    let payload: AccessTokenPayload
    try {
      // Delegate signature/claims checks (iss/aud/exp/nbf/etc.) to your verifier
      payload = await this.verifier.verifyAccess(token)
    } catch {
      // Avoid leaking verification details in responses
      throw new UnauthorizedException('Invalid or expired token')
    }

    // Defensive: verify we are dealing with an access token (not refresh)
    if (payload.typ !== 'access') {
      throw new UnauthorizedException('Token type not allowed')
    }

    // Build a lightweight `UserContext` for downstream handlers/guards.
    // NOTE: You can enrich this via DB lookups in another guard/interceptor.
    const user: UserContext = {
      id: (payload.sub as Subject) ?? '',
      email: undefined, // set later if you hydrate from DB
      displayName: undefined,
      orgId: (payload.org as string | undefined) ?? undefined,
      teamId: undefined,
      roles: undefined, // resolved by your RBAC layer
      scopes: normalizeScopes(payload.scope), // <- strongly typed Scope[]
      sessionId: (payload.sid as string | undefined) ?? null,
      jti: (payload.jti as Jti | string | undefined) ?? null
    }

    // Attach to the request so controllers/resolvers and other guards can use it
    req.user = user

    // Optional: propagate a correlation/request id for logs/telemetry
    const requestId =
      asHeaderString(req.headers?.[HEADER.REQUEST_ID]) ??
      asHeaderString(req.headers?.['x-request-id'])
    if (requestId) {
      req.requestId = requestId
    }

    return true
  }
}
