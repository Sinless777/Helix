// libs/auth/src/lib/guards/scopes.guard.ts
// -----------------------------------------------------------------------------
// ScopesGuard
// -----------------------------------------------------------------------------
// Purpose
//   Enforce fine-grained authorization based on the `@Scopes()` decorator.
//   - Reads metadata attached by @Scopes() (required scopes + match mode)
//   - Works for both HTTP and GraphQL (no hard dependency on @nestjs/graphql)
//   - Expects a typed `req.user.scopes: Scope[]` (e.g., from JwtAuthGuard)
// Behavior
//   If no scopes metadata is present on the handler/class, this guard allows
//   access (no-op). Otherwise it requires the caller to have the necessary
//   scopes per the `mode` ('all' or 'any').
//
// Typical usage
//   @UseGuards(JwtAuthGuard, ScopesGuard)
//   @Scopes('users.read')
//   async listUsers() { ... }
//
//   @Scopes(['users.write', 'teams.write'], 'any')
//   async modifyEither() { ... }

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import {
  SCOPES_METADATA_KEY,
  type ScopesMetadata
} from '../decorators/scopes.decorator'
import type { Scope } from '../types/auth.types'

/* -----------------------------------------------------------------------------
 * Request resolution helpers (HTTP + optional GraphQL)
 * -------------------------------------------------------------------------- */

/**
 * Obtain a Request-like object from either HTTP or GraphQL execution context.
 * - HTTP: ctx.switchToHttp().getRequest()
 * - GraphQL: lazily require('@nestjs/graphql') so this lib doesn’t depend on it
 */
function getRequest(ctx: ExecutionContext): any | undefined {
  if (ctx.getType() === 'http') {
    return ctx.switchToHttp().getRequest()
  }
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

/* -----------------------------------------------------------------------------
 * Scope matching
 * -------------------------------------------------------------------------- */

/** Efficient membership check using a Set. */
function hasScopesAll(have: Scope[], required: Scope[]): boolean {
  const set = new Set(have)
  for (const s of required) {
    if (!set.has(s)) return false
  }
  return true
}

function hasScopesAny(have: Scope[], required: Scope[]): boolean {
  const set = new Set(have)
  for (const s of required) {
    if (set.has(s)) return true
  }
  return false
}

/* -----------------------------------------------------------------------------
 * Guard implementation
 * -------------------------------------------------------------------------- */

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1) Read @Scopes() metadata from method → class (method wins)
    //    If nothing declared, do nothing (allow access).
    const meta = this.reflector.getAllAndOverride<ScopesMetadata | undefined>(
      SCOPES_METADATA_KEY,
      [context.getHandler(), context.getClass()]
    )
    if (!meta || !meta.required || meta.required.length === 0) {
      return true
    }

    // 2) Get the current request (HTTP or GraphQL) and pull user scopes.
    const req = getRequest(context)
    const userScopes = (req?.user?.scopes ?? []) as Scope[]

    // 3) Enforce according to the requested mode.
    const mode = meta.mode ?? 'all'
    const ok =
      mode === 'any'
        ? hasScopesAny(userScopes, meta.required)
        : hasScopesAll(userScopes, meta.required)

    if (!ok) {
      // Build a helpful error message indicating what’s missing.
      const haveSet = new Set(userScopes)
      const missing = meta.required.filter((s) => !haveSet.has(s))
      const detail =
        mode === 'any'
          ? `requires any of: ${meta.required.join(', ')}`
          : `missing: ${missing.join(', ')}`

      // Throw 403 (Forbidden) because the caller is authenticated but not authorized.
      throw new ForbiddenException(`Insufficient scope: ${detail}`)
    }

    // 4) Optionally, attach authorization summary for downstream logging.
    //    (No runtime dependency; safe to ignore if unused.)
    req.authz = {
      mode,
      required: meta.required,
      have: userScopes,
      ok: true
    }

    return true
  }
}
