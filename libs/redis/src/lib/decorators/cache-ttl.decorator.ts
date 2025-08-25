import {
  SetMetadata,
  type CustomDecorator,
  type ExecutionContext,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Milliseconds, Seconds } from '../redis.types'
import { ttlSeconds } from '../utils/ttl.util'

/** Metadata keys */
export const CACHE_TTL_METADATA = 'helix:redis:cache_ttl'
export const NO_CACHE_METADATA = 'helix:redis:no_cache'

export interface CacheTtlMeta {
  /** Hard TTL for the cached value (in seconds, branded). */
  ttl: Seconds
  /**
   * Optional stale-while-revalidate time (in seconds, branded).
   * If present, allow serving stale for this duration while refreshing in background.
   */
  swr?: Seconds
  /**
   * Optional fixed cache key suffix (you can also build keys in your interceptor).
   * Useful if you want to pin a handler to a stable key regardless of params.
   */
  key?: string
}

export interface CacheTtlOptions {
  /** e.g. '30s' | 30 | Seconds | Milliseconds */
  staleWhileRevalidate?: string | number | Seconds | Milliseconds
  /** Optional fixed key suffix */
  key?: string
}

/**
 * Decorate a route/controller with a cache TTL.
 * Examples:
 *   @CacheTTL('5m')
 *   @CacheTTL(300, { staleWhileRevalidate: '1m' })
 *   @CacheTTL(s(300))
 */
export function CacheTTL(
  ttlInput: string | number | Seconds | Milliseconds,
  opts: CacheTtlOptions = {}
): CustomDecorator<string> {
  const meta: CacheTtlMeta = {
    ttl: ttlSeconds(ttlInput),
    swr:
      opts.staleWhileRevalidate != null
        ? ttlSeconds(opts.staleWhileRevalidate)
        : undefined,
    key: opts.key,
  }
  return SetMetadata(CACHE_TTL_METADATA, meta)
}

/** Explicitly disable caching for a handler/class (overrides @CacheTTL). */
export function NoCache(): CustomDecorator<string> {
  return SetMetadata(NO_CACHE_METADATA, true)
}

/**
 * Helper to read cache TTL metadata with standard Nest precedence:
 * method-level overrides class-level.
 */
export function getCacheTtlMeta(
  reflector: Reflector,
  context: ExecutionContext
): CacheTtlMeta | undefined {
  const handler = context.getHandler?.()
  const targetClass = context.getClass?.()

  // If NoCache is present anywhere, treat as disabled.
  const disabled = reflector.getAllAndOverride<boolean>(NO_CACHE_METADATA, [
    handler,
    targetClass,
  ])
  if (disabled) return undefined

  return reflector.getAllAndOverride<CacheTtlMeta>(CACHE_TTL_METADATA, [
    handler,
    targetClass,
  ])
}
