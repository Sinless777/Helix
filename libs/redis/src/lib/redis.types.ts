/**
 * Minimal, library-agnostic Redis types for the Helix codebase.
 * These keep us decoupled from a specific Redis client (ioredis / node-redis).
 * Implementations in `clients/` should conform to these interfaces.
 */

// ──────────────────────────────────────────────────────────────────────────────
// time helpers
// ──────────────────────────────────────────────────────────────────────────────

export type Milliseconds = number & { readonly __brand: 'ms' }
export type Seconds = number & { readonly __brand: 's' }

// ──────────────────────────────────────────────────────────────────────────────
// TLS + connection options
// ──────────────────────────────────────────────────────────────────────────────

/** Narrow TLS options we actually use; feel free to extend if needed. */
export interface TlsOptionsLike {
  /** If false, Node will reject self-signed/invalid certs (default true). */
  rejectUnauthorized?: boolean
  /** PEM contents or path already read. */
  ca?: string | Buffer | Array<string | Buffer>
  cert?: string | Buffer
  key?: string | Buffer
  /** Optional SNI override / servername. */
  servername?: string
}

export type RedisMode = 'standalone' | 'cluster' | 'sentinel'

export interface StandaloneOptions {
  mode: 'standalone'
  /** Hostname or IP; defaults to 'localhost' if omitted by the client impl. */
  host?: string
  /** Port; defaults to 6379. */
  port?: number
  /** Database index (0-15 typically). */
  db?: number
  /** Username (ACLs). */
  username?: string
  /** Password (ACLs). */
  password?: string
  /** redis:// URL; if set, overrides host/port/db/username/password. */
  url?: string
  /** Prefix to transparently prepend to keys (do NOT include trailing colon). */
  keyPrefix?: string
  /** Enable TLS or pass TLS options. */
  tls?: boolean | TlsOptionsLike
  /** Socket keepalive in ms. */
  keepAliveMs?: Milliseconds
}

export interface ClusterNodeAddress {
  host: string
  port: number
}

export interface ClusterOptions {
  mode: 'cluster'
  /** Node addresses like [{host,port}] or "host:port" strings. */
  nodes: Array<ClusterNodeAddress | string>
  /** Prefix to transparently prepend to keys. */
  keyPrefix?: string
  /** Reuse standalone fields for auth/TLS per-node. */
  redisOptions?: Omit<StandaloneOptions, 'mode' | 'host' | 'port' | 'url'>
  /** Optional DNS lookup hook if you want custom resolution. */
  dnsLookup?: (
    address: string,
    callback: (err: NodeJS.ErrnoException | null, address: string) => void
  ) => void
}

export interface SentinelAddress {
  host: string
  port: number
}

export interface SentinelOptions {
  mode: 'sentinel'
  /** Sentinel endpoints. */
  sentinels: SentinelAddress[]
  /** Master group name (e.g., "mymaster"). */
  name: string
  /** Auth for the master (if required). */
  username?: string
  password?: string
  db?: number
  keyPrefix?: string
  tls?: boolean | TlsOptionsLike
}

export type RedisConnectionOptions =
  | StandaloneOptions
  | ClusterOptions
  | SentinelOptions

// ──────────────────────────────────────────────────────────────────────────────
// Module options
// ──────────────────────────────────────────────────────────────────────────────

export interface RedisModuleOptions {
  /** When true and used at app root, exports providers globally. */
  isGlobal?: boolean

  /** Connection shape (standalone/cluster/sentinel). */
  connection: RedisConnectionOptions

  /** Attempt to combine commands automatically (client support required). */
  enableAutoPipelining?: boolean

  /** Timeout for a single command (ms). */
  commandTimeoutMs?: Milliseconds

  /** If supported by the client, avoid connecting until first command. */
  lazyConnect?: boolean

  /** Maximum retries per command before failing (client-specific). */
  maxRetriesPerRequest?: number

  /** Health check behavior (used by Terminus or custom probes). */
  healthCheck?: {
    enabled: boolean
    /** Key to ping for write/read cycle; defaults to "helix:health" */
    key?: string
    /** Interval for background checks if a watcher is implemented. */
    intervalMs?: Milliseconds
    /** Maximum time to wait for ping round-trip. */
    timeoutMs?: Milliseconds
  }

  /** Optional telemetry toggles. */
  telemetry?: {
    enabled?: boolean
    captureCommands?: boolean
  }
}

export interface RedisModuleAsyncOptions {
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions
  inject?: any[]
  imports?: any[]
}

// ──────────────────────────────────────────────────────────────────────────────
// Client abstractions (keep minimal & promise-based)
// ──────────────────────────────────────────────────────────────────────────────

export interface RedisClient {
  /** Get raw string value; JSON helpers live in utils. */
  get(key: string): Promise<string | null>
  /** Set raw string; optional TTL in seconds. */
  set(key: string, value: string, ttlSeconds?: Seconds): Promise<'OK' | null>
  /** Delete one or more keys; returns number of keys removed. */
  del(...keys: string[]): Promise<number>
  /** Increment integer value; initializes at 0 if missing. */
  incr(key: string): Promise<number>
  /** Expire key in N seconds; returns 1 if set, 0 otherwise. */
  expire(key: string, ttlSeconds: Seconds): Promise<number>
  /** Check key existence count. */
  exists(...keys: string[]): Promise<number>

  /** Evaluate Lua (if supported by the client). */
  eval(
    script: string,
    numKeys: number,
    ...args: Array<string | number>
  ): Promise<unknown>

  /** Publish to a channel; returns number of subscribers that received the message. */
  publish(channel: string, message: string): Promise<number>

  /** Close the connection gracefully. */
  quit(): Promise<void>
}

/**
 * Subscriber connection — usually a separate client in most libraries.
 * Implementations should manage subscription lifecycle & callbacks.
 */
export interface RedisSubscriber {
  subscribe(
    channel: string,
    onMessage: (message: string, channel: string) => void
  ): Promise<void>
  psubscribe(
    pattern: string,
    onMessage: (message: string, channel: string) => void
  ): Promise<void>
  unsubscribe(channel: string): Promise<void>
  punsubscribe(pattern: string): Promise<void>
  quit(): Promise<void>
}

/** Discriminated union describing which client we hold. */
export type RedisClientRef =
  | { kind: 'standalone'; client: RedisClient }
  | { kind: 'cluster'; client: RedisClient }
  | { kind: 'sentinel'; client: RedisClient }

// ──────────────────────────────────────────────────────────────────────────────
// Key building & TTL config
// ──────────────────────────────────────────────────────────────────────────────

/** Common namespaces used across features (opinionated but extensible). */
export type KeyNamespace =
  | 'cache'
  | 'rate'
  | 'otp'
  | 'session'
  | 'refresh'
  | 'jti'
  | 'device'
  | 'apiKey'
  | 'feature'
  | 'custom'

/** Input to key builder utilities. */
export interface KeyBuild {
  ns: KeyNamespace
  parts: (string | number | boolean | undefined | null)[]
  /** Optional prefix override (otherwise use connection.keyPrefix). */
  prefix?: string
}

/** Default TTLs (override per-call if needed). */
export interface RedisTtls {
  cacheTtl?: Seconds // e.g., 300s
  otpTtl?: Seconds // e.g., 300s
  sessionTtl?: Seconds // e.g., 60 * 60 * 24 * 7
  refreshTtl?: Seconds // e.g., 60 * 60 * 24 * 30
  jtiTtl?: Seconds // e.g., same as refreshTtl
  rateWindowTtl?: Seconds // sliding window bucket TTL
  deviceTrustTtl?: Seconds // "remember device" TTL
}

// ──────────────────────────────────────────────────────────────────────────────
// Feature-specific records & results
// ──────────────────────────────────────────────────────────────────────────────

/** Sliding window / fixed window rate-limit result. */
export interface RateLimitResult {
  allowed: boolean
  /** Requests remaining in the window. */
  remaining: number
  /** Window capacity. */
  limit: number
  /** UTC when the window resets. */
  resetAt: Date
  /** Milliseconds until next allowed request. */
  retryInMs: Milliseconds
  /** Total hits observed in current window (debug/telemetry). */
  totalHits?: number
}

/** Token bucket result (if you implement TB in utils). */
export interface TokenBucketResult {
  allowed: boolean
  /** Tokens remaining after this request. */
  tokens: number
  /** Bucket capacity. */
  capacity: number
  /** When the bucket will be full (approx). */
  fullRefillAt?: Date
  /** Next token availability in ms. */
  nextInMs?: Milliseconds
}

/** OTP (email/SMS) backing record. */
export interface OtpRecord {
  /** SHA256 (or better) hash of the code; never store cleartext codes. */
  codeHash: string
  /** Purpose discriminator, e.g., 'login', 'mfa', 'password_reset'. */
  purpose: string
  /** How many attempts used. */
  tries: number
  /** Max attempts allowed. */
  maxTries: number
  /** ISO timestamp for expiry. */
  expiresAt: string
  /** Phone/email this OTP was issued to (optional). */
  target?: string
  /** Arbitrary metadata (e.g., geo, ip). */
  meta?: Record<string, unknown>
}

/** Session record for bearer sessions. */
export interface SessionRecord {
  sessionId: string // random id (not JWT)
  userId: string
  orgId?: string | null
  /** ISO timestamps for lifecycle. */
  issuedAt: string // when created
  expiresAt: string // absolute expiry
  /** Last activity hints (for idle timeout, if you implement it). */
  lastSeenAt?: string | null
  /** Device/IP details for security UX. */
  ip?: string | null
  ua?: string | null
  deviceId?: string | null
  /** Optional: elevate if MFA verified in-session. */
  mfaLevel?: 'none' | 'totp' | 'sms' | 'webauthn' | 'step-up'
  /** Soft revoke marker. */
  revokedAt?: string | null
}

/** Record for rotating refresh tokens & reuse detection (JTI). */
export interface RefreshTokenRecord {
  jti: string // token id (uuid)
  userId: string
  sessionId: string
  /** Chain information for rotation. */
  rotatedFrom?: string | null // previous jti
  rotatedAt?: string | null // ISO when rotation happened
  /** Expiry/revocation. */
  expiresAt: string
  revokedAt?: string | null
  /** Security context at issuance. */
  ip?: string | null
  ua?: string | null
  deviceId?: string | null
  /** Freeform metadata (e.g., client app/version). */
  meta?: Record<string, unknown>
}

/** Reuse detection lookup result. */
export interface ReuseDetectionResult {
  /** If true, token was seen/revoked (suspicious). */
  reused: boolean
  /** Optional pointer to the session/jti involved. */
  jti?: string
  sessionId?: string
  /** When the reuse was observed (ISO). */
  observedAt?: string
}

/** Simple cache options for repositories. */
export interface CacheSetOptions {
  /** TTL in seconds; omit/0 means no TTL. */
  ttl?: Seconds
  /** If true, only set if not exists (SET NX). */
  nx?: boolean
  /** If true, only set if exists (SET XX). */
  xx?: boolean
  /** Keep around some small metadata alongside the value. */
  meta?: Record<string, unknown>
}

export interface CacheHit<T = unknown> {
  hit: true
  value: T
  /** Optional metadata if stored. */
  meta?: Record<string, unknown>
}

export interface CacheMiss {
  hit: false
}

export type CacheResult<T = unknown> = CacheHit<T> | CacheMiss

// ──────────────────────────────────────────────────────────────────────────────
// Errors
// ──────────────────────────────────────────────────────────────────────────────

export interface RedisError extends Error {
  code?: string
  /** Underlying client error details (stringified if non-serializable). */
  details?: unknown
}
