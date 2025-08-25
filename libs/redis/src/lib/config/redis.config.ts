import { readFileSync } from 'node:fs'
import { isAbsolute } from 'node:path'
import {
  DEFAULT_COMMAND_TIMEOUT,
  DEFAULT_MAX_RETRIES_PER_REQUEST,
  DEFAULT_REDIS_DB,
  DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PORT,
  KEY_PREFIX as DEFAULT_KEY_PREFIX,
} from '../redis.constants'

/**
 * Minimal config shape used across the app.
 * Adapt to other Redis clients if you don't use ioredis.
 */
export interface RedisConfig {
  /** Prefer a single REDIS_URL (supports redis://, rediss://). */
  url?: string

  /** Host/port/db fallback if URL not provided. */
  host: string
  port: number
  db: number

  /** Optional ACL/user/pass. */
  username?: string
  password?: string

  /** Optional TLS config (when using rediss or a secured endpoint). */
  tls?: {
    ca?: string | Buffer
    cert?: string | Buffer
    key?: string | Buffer
    rejectUnauthorized?: boolean
  }

  /** Global key prefix (used by your key builder too). */
  keyPrefix: string

  /** Client behavior defaults. */
  maxRetriesPerRequest: number
  commandTimeoutMs: number

  /** Optional additional ioredis-like flags */
  enableAutoPipelining?: boolean
  lazyConnect?: boolean
  keepAlive?: number
  connectTimeoutMs?: number
}

/** Load config from environment (with safe defaults for devcontainer). */
export function loadRedisConfig(
  env: NodeJS.ProcessEnv = process.env
): RedisConfig {
  const url = str(env.REDIS_URL)
  const host = str(env.REDIS_HOST, DEFAULT_REDIS_HOST)
  const port = int(env.REDIS_PORT, DEFAULT_REDIS_PORT)
  const db = int(env.REDIS_DB, DEFAULT_REDIS_DB)
  const username = str(env.REDIS_USERNAME)
  const password = str(env.REDIS_PASSWORD)
  const keyPrefix = str(env.REDIS_KEY_PREFIX, DEFAULT_KEY_PREFIX)

  // TLS flags
  const tlsEnabled =
    bool(env.REDIS_TLS) ||
    (typeof url === 'string' && url.startsWith('rediss://'))

  const tlsCaPath = str(env.REDIS_TLS_CA)
  const tlsCertPath = str(env.REDIS_TLS_CERT)
  const tlsKeyPath = str(env.REDIS_TLS_KEY)
  const rejectUnauthorized =
    env.REDIS_TLS_REJECT_UNAUTHORIZED != null
      ? bool(env.REDIS_TLS_REJECT_UNAUTHORIZED)
      : true

  const tls = tlsEnabled
    ? {
        ca: tlsCaPath ? readMaybe(tlsCaPath) : undefined,
        cert: tlsCertPath ? readMaybe(tlsCertPath) : undefined,
        key: tlsKeyPath ? readMaybe(tlsKeyPath) : undefined,
        rejectUnauthorized,
      }
    : undefined

  // Client behavior
  const maxRetriesPerRequest = int(
    env.REDIS_MAX_RETRIES_PER_REQUEST,
    DEFAULT_MAX_RETRIES_PER_REQUEST
  )
  const commandTimeoutMs = int(
    env.REDIS_COMMAND_TIMEOUT_MS,
    Number(DEFAULT_COMMAND_TIMEOUT)
  )
  const enableAutoPipelining =
    env.REDIS_ENABLE_AUTO_PIPELINING != null
      ? bool(env.REDIS_ENABLE_AUTO_PIPELINING)
      : undefined
  const lazyConnect =
    env.REDIS_LAZY_CONNECT != null ? bool(env.REDIS_LAZY_CONNECT) : undefined
  const keepAlive =
    env.REDIS_KEEP_ALIVE != null ? int(env.REDIS_KEEP_ALIVE, 0) : undefined
  const connectTimeoutMs =
    env.REDIS_CONNECT_TIMEOUT_MS != null
      ? int(env.REDIS_CONNECT_TIMEOUT_MS, 10000)
      : undefined

  return {
    url,
    host,
    port,
    db,
    username,
    password,
    tls,
    keyPrefix,
    maxRetriesPerRequest,
    commandTimeoutMs,
    enableAutoPipelining,
    lazyConnect,
    keepAlive,
    connectTimeoutMs,
  }
}

/**
 * Convert our config to ioredis constructor options.
 * Usage:
 *   import Redis from 'ioredis';
 *   const cfg = loadRedisConfig();
 *   const client = cfg.url
 *     ? new Redis(cfg.url, toIoRedisOptions(cfg))
 *     : new Redis(toIoRedisOptions(cfg));
 */
export function toIoRedisOptions(cfg: RedisConfig): Record<string, unknown> {
  const base: Record<string, unknown> = {
    host: cfg.host,
    port: cfg.port,
    db: cfg.db,
    username: cfg.username,
    password: cfg.password,
    tls: cfg.tls,
    // behavior
    maxRetriesPerRequest: cfg.maxRetriesPerRequest,
    commandTimeout: cfg.commandTimeoutMs,
    enableAutoPipelining: cfg.enableAutoPipelining,
    lazyConnect: cfg.lazyConnect,
    keepAlive: cfg.keepAlive,
    connectTimeout: cfg.connectTimeoutMs,
    // NOTE: ioredis supports keyPrefix; we generally apply our own prefix via key builders.
    // keyPrefix: cfg.keyPrefix ? `${cfg.keyPrefix}:` : undefined,
  }
  return base
}

/* ───────────────────────────── helpers ───────────────────────────── */

/** Overloads so passing a fallback yields a non-undefined string type. */
function str(v: unknown, fallback: string): string
function str(v: unknown): string | undefined
function str(v: unknown, fallback?: string): string | undefined {
  if (v == null) return fallback
  const s = String(v).trim()
  return s.length ? s : fallback
}

function int(v: unknown, fallback: number): number {
  const n = Number(v)
  return Number.isFinite(n) ? Math.floor(n) : fallback
}

function bool(v: unknown, fallback = false): boolean {
  if (v == null) return fallback
  const s = String(v).trim().toLowerCase()
  return s === '1' || s === 'true' || s === 'yes' || s === 'y' || s === 'on'
}

function readMaybe(path: string): Buffer | undefined {
  try {
    const p = isAbsolute(path) ? path : `${process.cwd()}/${path}`
    return readFileSync(p)
  } catch {
    return undefined
  }
}
