// libs/auth/src/lib/decorators/org-context.decorator.ts
// ----------------------------------------------------------------------------
// Org / Team context parameter decorators for NestJS (HTTP + GraphQL-friendly)
// ----------------------------------------------------------------------------
//
// What this file provides
// -----------------------
// • A small resolver that finds the current organization/team context for a
//   request.
// • Three decorators you can use in controllers/resolvers:
//     - @OrgContext() → { orgId, teamId, source }
//     - @OrgId()      → string | undefined
//     - @TeamId()     → string | undefined
// • It works out-of-the-box for HTTP. If @nestjs/graphql is installed, it
//   also supports GraphQL without creating a hard dependency.
//
// Precedence rules (first hit wins):
//   1) Authenticated principal (req.user.orgId / req.user.teamId)
//   2) Header (x-tenant-id by default, override via options)
//   3) Query string (?orgId=&teamId=)
//   4) Route params  (/orgs/:orgId/:teamId?)
//   5) None → undefined
//
// Notes on typing createParamDecorator
// ------------------------------------
// createParamDecorator accepts up to TWO generics (factory data, context).
// We annotate the factory function's RETURN TYPE directly, rather than trying
// to provide it as a third generic (which would cause TS2558 errors).

import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext
} from '@nestjs/common'
import { HEADER } from '../constants/auth.constants'

// Where the org/team context came from. Helpful for debugging and logging.
export type OrgContextSource = 'user' | 'header' | 'query' | 'param' | 'none'

// The resolved context value we hand to handlers via @OrgContext().
export interface OrgContextValue {
  orgId?: string | null
  teamId?: string | null
  source: OrgContextSource
}

// Options to influence resolution and validation.
export interface OrgContextOptions {
  /** If true, throw 400 when we cannot determine an orgId. */
  required?: boolean
  /** Header name to read org id from; defaults to x-tenant-id. */
  headerName?: string
}

// Minimal request shape we operate on. We avoid importing Express types to keep
// this lib light and GraphQL-friendly.
type ReqLike = {
  user?: { orgId?: string | null; teamId?: string | null }
  headers?: Record<string, unknown>
  query?: Record<string, unknown>
  params?: Record<string, unknown>
}

/**
 * Obtain a Request-like object for either HTTP or GraphQL contexts.
 * - For HTTP, we use the standard switchToHttp().getRequest().
 * - For GraphQL, we try to lazily require('@nestjs/graphql') to avoid creating
 *   a hard runtime dependency. If it is not installed, we silently fall back.
 */
function getRequest(ctx: ExecutionContext): ReqLike | undefined {
  // HTTP path: nothing fancy
  if (ctx.getType() === 'http') {
    return ctx.switchToHttp().getRequest()
  }

  // GraphQL path: load only if available to keep this lib optional
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GqlExecutionContext } = require('@nestjs/graphql')
    const gqlCtx = GqlExecutionContext.create(ctx)
    return gqlCtx.getContext()?.req
  } catch {
    // @nestjs/graphql not installed — just fall through
  }
  return undefined
}

/**
 * Convert an arbitrary value into a trimmed non-empty string (or undefined).
 * - If the value is an array (as headers sometimes are), we take the first
 *   element.
 * - Empty strings and whitespace-only strings normalize to undefined.
 */
function str(v: unknown): string | undefined {
  if (v == null) return undefined
  if (Array.isArray(v)) return v.length ? String(v[0]) : undefined
  const s = String(v).trim()
  return s.length ? s : undefined
}

/**
 * Core resolver that determines the effective organization/team context.
 * It follows the precedence order documented at the top of the file.
 */
export function resolveOrgContext(
  ctx: ExecutionContext,
  opts?: OrgContextOptions
): OrgContextValue {
  const req = getRequest(ctx)

  // Normalize/override the header name (lower-cased for case-insensitive lookup)
  const headerName = (opts?.headerName ?? HEADER.TENANT_ID).toLowerCase()

  // 1) Prefer the authenticated principal (if any)
  const userOrg = req?.user?.orgId ?? undefined
  const userTeam = req?.user?.teamId ?? undefined
  if (userOrg) {
    return { orgId: userOrg, teamId: userTeam ?? undefined, source: 'user' }
  }

  // 2) Header (e.g., x-tenant-id). Some frameworks coerce headers into arrays; str() handles it.
  const hdrs = (req?.headers ?? {}) as Record<string, unknown>
  const fromHeader = str(hdrs[headerName])
  if (fromHeader) {
    return { orgId: fromHeader, teamId: undefined, source: 'header' }
  }

  // 3) Query string (?orgId=&teamId=)
  const q = (req?.query ?? {}) as Record<string, unknown>
  const qOrg = str(q['orgId'])
  const qTeam = str(q['teamId'])
  if (qOrg) {
    return { orgId: qOrg, teamId: qTeam, source: 'query' }
  }

  // 4) Route params (/orgs/:orgId/:teamId?)
  const p = (req?.params ?? {}) as Record<string, unknown>
  const pOrg = str(p['orgId'])
  const pTeam = str(p['teamId'])
  if (pOrg) {
    return { orgId: pOrg, teamId: pTeam, source: 'param' }
  }

  // 5) Nothing found
  return { orgId: undefined, teamId: undefined, source: 'none' }
}

/* ------------------------------- Decorators ------------------------------- */
// Below we expose three decorators. All use createParamDecorator with at most
// two generics (factory data, context). We annotate the return type on the
// factory function to avoid TS2558.

/**
 * @OrgContext() → injects a full { orgId, teamId, source } object.
 * If `required: true` is passed and no org is resolved, a 400 Bad Request is thrown.
 */
export const OrgContext = createParamDecorator<OrgContextOptions | undefined>(
  (
    opts: OrgContextOptions | undefined,
    ctx: ExecutionContext
  ): OrgContextValue => {
    const value = resolveOrgContext(ctx, opts)
    if (opts?.required && !value.orgId) {
      throw new BadRequestException('Organization context is required')
    }
    return value
  }
)

/**
 * @OrgId() → injects just the orgId (or undefined).
 * Honors `required: true` to enforce presence.
 */
export const OrgId = createParamDecorator<OrgContextOptions | undefined>(
  (
    opts: OrgContextOptions | undefined,
    ctx: ExecutionContext
  ): string | undefined => {
    const { orgId } = resolveOrgContext(ctx, opts)
    if (opts?.required && !orgId) {
      throw new BadRequestException('Organization context is required')
    }
    return orgId ?? undefined
  }
)

/**
 * @TeamId() → injects just the teamId (if any). No `required` enforcement,
 * because team context is usually optional even when an org is required.
 */
export const TeamId = createParamDecorator<OrgContextOptions | undefined>(
  (
    opts: OrgContextOptions | undefined,
    ctx: ExecutionContext
  ): string | undefined => {
    const { teamId } = resolveOrgContext(ctx, opts)
    return teamId ?? undefined
  }
)
