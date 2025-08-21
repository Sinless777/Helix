// libs/redis/src/lib/interceptors/cache.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Optional,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import { Observable, from, of } from 'rxjs'
import { switchMap, tap } from 'rxjs/operators'

import type { RedisClient, Seconds } from '../redis.types'
import { REDIS_CLIENT } from '../redis.constants'

/**
 * Metadata keys we’ll check for a per-handler TTL override.
 * If you created your own decorator, make sure it writes one of these.
 */
const TTL_META_KEYS = [
  'redis:cache:ttl', // preferred
  'cache:ttl', // alternates
  'CACHE_TTL',
] as const

export interface CacheInterceptorOptions {
  /** Default TTL for cache entries (seconds). */
  defaultTtl?: Seconds
  /** Key prefix namespace. */
  prefix?: string
  /** If true, only caches idempotent GET requests. */
  onlyGet?: boolean
  /** Header name that forces bypass when present (truthy). */
  skipHeader?: string // e.g., 'x-cache-skip'
  /** Headers to include in cache key (like Vary). */
  varyByHeaders?: string[]
}

const DEFAULTS: Required<CacheInterceptorOptions> = {
  defaultTtl: 60 as Seconds,
  prefix: 'helix:cache:http',
  onlyGet: true,
  skipHeader: 'x-cache-skip',
  varyByHeaders: ['accept-language'],
}

// Small local hasher to avoid importing additional utils.
function shortHash(input: string): string {
  // Fowler–Noll–Vo (FNV-1a) 32-bit
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash =
      (hash +
        ((hash << 1) +
          (hash << 4) +
          (hash << 7) +
          (hash << 8) +
          (hash << 24))) >>>
      0
  }
  // Render as fixed-length hex
  return ('00000000' + hash.toString(16)).slice(-8)
}

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  private readonly cfg: Required<CacheInterceptorOptions>

  constructor(
    private readonly reflector: Reflector,
    @Optional() opts?: CacheInterceptorOptions,
    @Optional() private readonly redis?: RedisClient
  ) {
    this.cfg = { ...DEFAULTS, ...(opts ?? {}) }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!this.redis) return next.handle()
    if (context.getType() !== 'http') return next.handle()

    const http = context.switchToHttp()
    const req = http.getRequest<Request & { user?: { id?: string } }>()

    if (this.cfg.onlyGet && (req.method ?? 'GET').toUpperCase() !== 'GET') {
      return next.handle()
    }

    const skipHeader = this.cfg.skipHeader.toLowerCase()
    const rawSkip = (req.headers as Record<string, unknown>)[skipHeader]
    const skip =
      (typeof rawSkip === 'string' &&
        (rawSkip.toLowerCase() === 'true' || rawSkip === '1')) ||
      (Array.isArray(rawSkip) &&
        rawSkip.some((v) => String(v).toLowerCase() === 'true' || v === '1'))

    if (skip) return next.handle()

    const ttl = (this.getRouteTtl(context) ?? this.cfg.defaultTtl) as Seconds
    const key = this.buildKey(req, ttl)

    // Read-through cache
    return from(this.redis.get(key)).pipe(
      switchMap((hit: string | null) => {
        if (hit != null) {
          try {
            return of(JSON.parse(hit))
          } catch {
            // Corrupt entry, fall through to recompute
          }
        }
        return next.handle().pipe(
          tap(async (value: unknown) => {
            try {
              const payload = JSON.stringify(value)
              // Your RedisClient.set signature is (key, value, ttlSeconds?)
              await this.redis!.set(key, payload, ttl)
            } catch {
              // never block response on cache write issues
            }
          })
        )
      })
    )
  }

  /** Resolve a per-route TTL (seconds) from known metadata keys. */
  private getRouteTtl(ctx: ExecutionContext): Seconds | null {
    for (const metaKey of TTL_META_KEYS) {
      const val = this.reflector.getAllAndOverride<number | null | undefined>(
        metaKey,
        [ctx.getHandler(), ctx.getClass()]
      )
      if (typeof val === 'number' && Number.isFinite(val) && val >= 0) {
        return val as Seconds
      }
      if (val === 0) return 0 as Seconds
    }
    return null
  }

  /** Build a deterministic cache key for the request. */
  private buildKey(
    req: Request & { user?: { id?: string } },
    ttl: Seconds
  ): string {
    const method = (req.method ?? 'GET').toUpperCase()
    const url = (req.originalUrl ?? req.url ?? '').split('#')[0]

    // Select/normalize Vary headers
    const headers = req.headers as Record<string, unknown>
    const varyParts: string[] = []
    for (const h of this.cfg.varyByHeaders) {
      const key = h.toLowerCase()
      const v = headers[key]
      if (v != null) {
        varyParts.push(`${key}:${Array.isArray(v) ? v.join(',') : String(v)}`)
      }
    }

    // Optional per-user scoping
    const userId = req.user?.id ?? ''

    const raw = JSON.stringify({
      m: method,
      u: url,
      h: varyParts,
      uid: userId,
      ttl,
    })
    const digest = shortHash(raw)
    return `${this.cfg.prefix}:${digest}`
  }
}
