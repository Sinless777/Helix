// libs/auth/src/lib/guards/org-context.guard.ts
// -----------------------------------------------------------------------------
// OrgContextGuard
// -----------------------------------------------------------------------------
// Purpose
//   Ensure a request carries an *organization context* (orgId), since many
//   multi-tenant operations must be scoped to a tenant/org. This guard:
//
//   • Resolves org context using the same precedence as your decorators:
//       1) req.user.orgId (set by upstream auth)
//       2) Header (x-tenant-id by default)
//       3) Query string (?orgId=&teamId=)
//       4) Route params  (/orgs/:orgId/:teamId?)
//   • Works for HTTP and (optionally) GraphQL without a hard dependency.
//   • Attaches the resolved value to req.org for convenient downstream access.
//   • Throws a 400 Bad Request if orgId is required but missing.
//
// Usage
//   @UseGuards(JwtAuthGuard, OrgContextGuard)
//   async doTenantThing(@OrgContext() org: OrgContextValue) { ... }
//
// Optional per-route override
//   Exported metadata key lets you *disable* the requirement:
//     import { SetMetadata } from '@nestjs/common'
//     import { ORG_REQUIRED_METADATA_KEY } from '@helix/auth/guards/org-context.guard'
//
//     @SetMetadata(ORG_REQUIRED_METADATA_KEY, false)
//     @UseGuards(JwtAuthGuard, OrgContextGuard)
//     getPublicThing() { ... }
//
// Default behavior
//   If the metadata is not present, the guard *requires* an orgId.

import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import {
  resolveOrgContext,
  type OrgContextValue
} from '../decorators/org-context.decorator'

/** Metadata key: set to `false` on a route/class to NOT require orgId. */
export const ORG_REQUIRED_METADATA_KEY = 'auth:org:required'

/* -----------------------------------------------------------------------------
 * Request resolution (HTTP + optional GraphQL)
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
 * Guard
 * -------------------------------------------------------------------------- */

@Injectable()
export class OrgContextGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1) Read per-handler/class metadata to see if org is required.
    //    If undefined, default is "required".
    const required = this.reflector.getAllAndOverride<boolean | undefined>(
      ORG_REQUIRED_METADATA_KEY,
      [context.getHandler(), context.getClass()]
    )
    const mustHaveOrg = required !== false

    // 2) Resolve the org context using shared precedence rules.
    const org: OrgContextValue = resolveOrgContext(context)

    // 3) If required but missing orgId → 400 Bad Request (input problem).
    //    (Consistent with the @OrgContext({ required: true }) decorator behavior.)
    if (mustHaveOrg && !org.orgId) {
      throw new BadRequestException('Organization context is required')
    }

    // 4) Attach the resolved context onto the request for downstream use.
    const req = getRequest(context)
    if (req) {
      // Non-destructive: preserve any existing value if already set upstream.
      req.org ??= org
    }

    // Allow the request to proceed.
    return true
  }
}
