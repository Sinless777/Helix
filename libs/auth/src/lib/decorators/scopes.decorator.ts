// libs/auth/src/lib/decorators/scopes.decorator.ts

import { SetMetadata } from '@nestjs/common'
import type {
  Scope,
  ScopeRequirement,
  ScopesRequirement,
  ScopeMatchMode
} from '../types/auth.types'

/** Nest metadata key your guard will read */
export const SCOPES_METADATA_KEY = 'auth:scopes'

/** Runtime shape we attach to metadata */
export interface ScopesMetadata {
  required: Scope[]
  mode: ScopeMatchMode // 'all' | 'any'
}

/** Small helpers */
const toArray = (s: ScopeRequirement): Scope[] =>
  Array.isArray(s) ? [...s] : [s]

const dedupe = (arr: Scope[]) => Array.from(new Set(arr))

/**
 * Normalize various inputs to a canonical metadata object.
 *
 * Examples:
 *  - Scopes('users.read')                      -> { required:['users.read'], mode:'all' }
 *  - Scopes('users.read','teams.write')        -> { required:['users.read','teams.write'], mode:'all' }
 *  - Scopes(['users.read','teams.write'], 'any')-> { required:['users.read','teams.write'], mode:'any' }
 *  - Scopes({ required:['keys.manage'], mode:'any' })
 */
function normalize(
  requirement: ScopeRequirement | ScopesRequirement,
  mode?: ScopeMatchMode
): ScopesMetadata {
  if (Array.isArray(requirement) || typeof requirement === 'string') {
    const required = dedupe(toArray(requirement))
    if (required.length === 0) {
      throw new Error('@Scopes() requires at least one scope')
    }
    return { required, mode: mode ?? 'all' }
  }

  const required = dedupe([...(requirement.required ?? [])])
  if (required.length === 0) {
    throw new Error('@Scopes() requires at least one scope')
  }
  return { required, mode: requirement.mode ?? 'all' }
}

/* -------------------------------------------------------------------------- */
/*  Decorators                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Declare required scopes on a resolver/route (or controller/class).
 *
 * Usage:
 *   @Scopes('users.read')
 *   @Scopes('users.read', 'teams.write')
 *   @Scopes(['users.read', 'teams.write'], 'any')
 *   @Scopes({ required: ['keys.manage'], mode: 'any' })
 */
export function Scopes(
  requirement: ScopeRequirement | ScopesRequirement,
  mode?: ScopeMatchMode
): MethodDecorator & ClassDecorator
export function Scopes(...scopes: Scope[]): MethodDecorator & ClassDecorator
export function Scopes(
  arg1: ScopeRequirement | ScopesRequirement | Scope,
  arg2?: ScopeMatchMode | Scope,
  ...rest: Scope[]
): MethodDecorator & ClassDecorator {
  // Support variadic scopes: Scopes('a','b','c')
  const value: ScopesMetadata =
    typeof arg1 === 'string' || Array.isArray(arg1)
      ? normalize(
          (Array.isArray(arg1) ? arg1 : [arg1]).concat(
            typeof arg2 === 'string' && (arg2 === 'all' || arg2 === 'any')
              ? []
              : typeof arg2 === 'string'
                ? [arg2]
                : []
          ) as Scope[],
          arg2 === 'all' || arg2 === 'any' ? arg2 : undefined
        )
      : normalize(arg1 as ScopesRequirement, arg2 as ScopeMatchMode | undefined)

  return SetMetadata(SCOPES_METADATA_KEY, value)
}

/** Sugar for “any of these scopes” */
export const AnyScope = (...scopes: Scope[]) =>
  SetMetadata(SCOPES_METADATA_KEY, normalize(scopes, 'any'))

/** Sugar for “all of these scopes” (explicit) */
export const AllScopes = (...scopes: Scope[]) =>
  SetMetadata(SCOPES_METADATA_KEY, normalize(scopes, 'all'))
