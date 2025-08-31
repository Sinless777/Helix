import { Inject, Injectable, Optional } from '@nestjs/common'
import type { RedisClient, Milliseconds, Seconds } from '../redis.types'
import { REDIS_CLIENT } from '../redis.constants'
import { ttlSeconds } from '../utils/ttl.util'
import { randomId } from '../utils/hash.util'

export type HealthStatus = 'up' | 'down'

export interface RedisHealthOptions {
  /** Max time to wait for individual Redis commands (default: 1000ms). */
  timeoutMs?: Milliseconds | number
  /**
   * Also verify a short TTL write/read.
   * If true, we SET a random key with small TTL and GET it back (default: false).
   */
  checkWrite?: boolean
  /** TTL used for the write-check key (default: '5s'). */
  writeTtl?: string | number | Seconds | Milliseconds
  /** Optional custom key to use for write-check (a random suffix is added). */
  keyBase?: string
  /** Expected response from PING (default: 'PONG'). */
  expectPong?: string
}

export interface RedisHealthResult {
  status: HealthStatus
  latencyMs?: number
  writeOk?: boolean
  error?: string
  details?: Record<string, unknown>
}

/** Race a promise with a timeout. */
function withTimeout<T>(
  p: Promise<T>,
  ms: number,
  label = 'operation'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms
    )
    p.then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (err) => {
        clearTimeout(t)
        reject(err)
      }
    )
  })
}

@Injectable()
export class RedisHealthService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
    @Optional() private readonly defaults?: RedisHealthOptions
  ) {}

  /**
   * Execute a health check against Redis.
   * - PING (with timeout) to measure latency
   * - Optional short SET/GET to ensure writes succeed
   */
  async check(opts: RedisHealthOptions = {}): Promise<RedisHealthResult> {
    const timeoutMsNum = Math.max(
      1,
      Number(opts.timeoutMs ?? this.defaults?.timeoutMs ?? 1000)
    )
    const doWrite = Boolean(
      opts.checkWrite ?? this.defaults?.checkWrite ?? false
    )
    const writeTtlSec: Seconds = ttlSeconds(
      opts.writeTtl ?? this.defaults?.writeTtl ?? '5s'
    )
    const keyBase = String(
      opts.keyBase ?? this.defaults?.keyBase ?? 'health:redis'
    )
    const expectPong = String(
      opts.expectPong ?? this.defaults?.expectPong ?? 'PONG'
    ).toUpperCase()

    const start = Date.now()
    try {
      const pong = await withTimeout(
        this.pingCompat(keyBase),
        timeoutMsNum,
        'PING'
      )
      const latencyMs = Date.now() - start

      const ok =
        typeof pong === 'string'
          ? pong.toUpperCase() === expectPong || pong.toUpperCase() === 'OK'
          : pong === 1 || pong === 0 || pong === true

      if (!ok) {
        return {
          status: 'down',
          latencyMs,
          error: `Unexpected PING response: ${String(pong)}`,
        }
      }

      if (!doWrite) {
        return { status: 'up', latencyMs }
      }

      const writeRes = await withTimeout(
        this.writeReadCompat(keyBase, writeTtlSec),
        timeoutMsNum,
        'WRITE/READ'
      )
      return {
        status: writeRes.ok ? 'up' : 'down',
        latencyMs,
        writeOk: writeRes.ok,
        error: writeRes.ok ? undefined : 'SET/GET mismatch',
        details: { key: writeRes.key, ttlSeconds: Number(writeTtlSec) },
      }
    } catch (err: any) {
      return {
        status: 'down',
        error: err?.message ?? String(err),
      }
    }
  }

  /** Try multiple ways to PING depending on client implementation. */
  private async pingCompat(
    keyBase: string
  ): Promise<string | number | boolean> {
    const r: any = this.redis as any

    // ioredis
    if (typeof r.ping === 'function') {
      return r.ping()
    }

    // node-redis v4
    if (typeof r.sendCommand === 'function') {
      try {
        return await r.sendCommand(['PING'])
      } catch {
        // fall through to other paths
      }
    }

    // Some clients expose a generic 'call' or 'command'
    if (typeof r.call === 'function') {
      try {
        return await r.call('PING')
      } catch {
        // fall through
      }
    }
    if (typeof r.command === 'function') {
      try {
        return await r.command('PING')
      } catch {
        // fall through
      }
    }

    // Fallback: a tiny write that returns truthy if it succeeds.
    const k = `${keyBase}:${randomId(6)}:ping`
    try {
      // node-redis style options
      await r.set(k, '1', { PX: 1000 })
    } catch {
      // ioredis vararg style
      await r.set(k, '1', 'PX', 1000)
    }
    return 'PONG'
  }

  /** Write + read round-trip using both node-redis and ioredis calling conventions. */
  private async writeReadCompat(
    keyBase: string,
    ttlSec: Seconds
  ): Promise<{ ok: boolean; key: string }> {
    const r: any = this.redis as any
    const key = `${keyBase}:${randomId(6)}`
    const val = `ok:${randomId(4)}`
    const ex = Number(ttlSec)

    try {
      // node-redis v4 style: options object
      await r.set(key, val, { EX: ex })
    } catch {
      // ioredis style: varargs
      await r.set(key, val, 'EX', ex)
    }
    const got = await r.get(key)
    return { ok: got === val, key }
  }
}
