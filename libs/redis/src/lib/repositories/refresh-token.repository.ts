// libs/redis/src/lib/repositories/refresh-token.repository.ts

/**
 * Minimal Redis interface required by this repository.
 * Create a tiny adapter if your client has different signatures (e.g., Upstash).
 */

// Add just above SubtleLike (near your crypto helper types)
type AlgorithmIdentifierLike = 'SHA-256' | { name: 'SHA-256' }

export interface RedisKvLike {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<unknown>
  del(key: string): Promise<number>
  pexpire(key: string, ttlMs: number): Promise<number | boolean>
  pttl(key: string): Promise<number>
  sadd(key: string, member: string): Promise<number>
  srem(key: string, member: string): Promise<number>
  smembers(key: string): Promise<string[]>
}

/** Narrow, portable crypto types (so we don't depend on lib.dom) */
type SubtleLike = {
  digest(
    algorithm: AlgorithmIdentifierLike,
    data: ArrayBuffer | ArrayBufferView
  ): Promise<ArrayBuffer>
}

type CryptoLike = {
  getRandomValues<T extends ArrayBufferView>(array: T): T
  subtle: SubtleLike
}

function getCrypto(): CryptoLike {
  const c = (globalThis as unknown as { crypto?: CryptoLike }).crypto
  if (!c) {
    throw new Error(
      'No WebCrypto available on globalThis.crypto. Provide your own token generator / hasher or run on a runtime with WebCrypto.'
    )
  }
  return c
}

/** Base64url w/o padding */
function b64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  const b64 =
    typeof Buffer !== 'undefined'
      ? Buffer.from(bytes).toString('base64')
      : btoa(bin)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function sha256Hex(input: string | Uint8Array): Promise<string> {
  const data =
    typeof input === 'string' ? new TextEncoder().encode(input) : input
  const digest = await getCrypto().subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(digest)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    const v = bytes[i].toString(16)
    hex += v.length === 1 ? '0' + v : v
  }
  return hex
}

function randomToken(bytes = 32): string {
  const arr = new Uint8Array(bytes)
  getCrypto().getRandomValues(arr)
  return b64url(arr.buffer)
}

/** Public shapes stored (server-side only). Never store raw token, only its hash. */
export interface RefreshTokenRecord {
  /** Hash of the opaque token (hex-encoded SHA-256) */
  tokenHash: string
  userId: string
  sessionId: string
  createdAt: number // epoch ms
  expiresAt: number // epoch ms
  rotation: number
  /** Optional, non-sensitive metadata (device name, ip country, user agent fingerprint hash, etc.) */
  meta?: Record<string, unknown>
}

/** Result objects returned by API */
export interface IssueResult {
  token: string // opaque bearer the client will store (e.g., httpOnly cookie)
  sessionId: string
  expiresAt: number
}

export interface VerifyResult {
  valid: boolean
  /** Present when valid === true */
  record?: Omit<RefreshTokenRecord, 'tokenHash'>
  reason?: 'missing' | 'expired'
}

export interface RotationResult extends IssueResult {
  /** Previous token is revoked (deleted) when rotation succeeds */
  rotatedFromSessionId: string
}

export interface RefreshTokenOptions {
  /** TTL in ms for a refresh token (default: 30 days) */
  ttlMs: number
  /** Prefix for redis keys (default: "rt") */
  prefix?: string
  /** Optional soft cap of active tokens per user; older ones are revoked if exceeded */
  maxPerUser?: number
}

/**
 * RefreshTokenRepository
 * - Issues opaque tokens and stores only their SHA-256 hash in Redis
 * - Supports verification, rotation, and revocation (single or all for a user)
 * - Keeps a per-user index to enable mass revocation
 */
export class RefreshTokenRepository {
  private readonly ttlMs: number
  private readonly prefix: string
  private readonly maxPerUser?: number

  constructor(
    private readonly redis: RedisKvLike,
    opts?: Partial<RefreshTokenOptions>
  ) {
    const envTtl = Number(process.env['REFRESH_TOKEN_TTL_MS'] ?? 2_592_000_000) // 30d
    const envMax = process.env['REFRESH_TOKEN_MAX_PER_USER']
    this.ttlMs = Number(opts?.ttlMs ?? envTtl)
    this.prefix = opts?.prefix ?? process.env['REFRESH_TOKEN_PREFIX'] ?? 'rt'
    this.maxPerUser =
      opts?.maxPerUser ?? (envMax != null ? Number(envMax) : undefined)
  }

  // ── Keys ────────────────────────────────────────────────────────────────────
  private kToken(hash: string) {
    return `${this.prefix}:t:${hash}`
  }
  private kUserSet(userId: string) {
    return `${this.prefix}:u:${userId}`
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  private async setWithTtl(key: string, value: string) {
    await this.redis.set(key, value)
    await this.redis.pexpire(key, this.ttlMs)
  }

  private async ensureKeyTtl(key: string) {
    const ttl = await this.redis.pttl(key)
    if (ttl < 0 || ttl > this.ttlMs) {
      await this.redis.pexpire(key, this.ttlMs)
    }
  }

  private async saveRecord(rec: RefreshTokenRecord): Promise<void> {
    const key = this.kToken(rec.tokenHash)
    await this.setWithTtl(key, JSON.stringify(rec))
    await this.redis.sadd(this.kUserSet(rec.userId), rec.tokenHash)
  }

  private async loadRecordByToken(
    token: string
  ): Promise<RefreshTokenRecord | null> {
    const tokenHash = await sha256Hex(token)
    const raw = await this.redis.get(this.kToken(tokenHash))
    if (!raw) return null
    const rec = JSON.parse(raw) as RefreshTokenRecord
    // refresh TTLs on read
    await this.ensureKeyTtl(this.kToken(tokenHash))
    await this.ensureKeyTtl(this.kUserSet(rec.userId))
    return rec
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Issue a new refresh token for a user. Returns the opaque token for the client.
   * The token is NOT stored in plaintext; only its hash is stored server-side.
   */
  async issue(
    userId: string,
    meta?: Record<string, unknown>
  ): Promise<IssueResult> {
    const token = randomToken(32)
    const tokenHash = await sha256Hex(token)
    const now = Date.now()
    const expiresAt = now + this.ttlMs
    const sessionId = randomToken(16)

    const rec: RefreshTokenRecord = {
      tokenHash,
      userId,
      sessionId,
      createdAt: now,
      expiresAt,
      rotation: 0,
      meta,
    }

    await this.saveRecord(rec)
    await this.enforceMaxPerUser(userId)

    return { token, sessionId, expiresAt }
  }

  /**
   * Verify a presented refresh token.
   */
  async verify(token: string): Promise<VerifyResult> {
    const rec = await this.loadRecordByToken(token)
    if (!rec) return { valid: false, reason: 'missing' }
    if (rec.expiresAt <= Date.now()) {
      // best-effort cleanup
      await this.revokeByHash(rec.userId, rec.tokenHash)
      return { valid: false, reason: 'expired' }
    }
    const { tokenHash: _omit, ...safe } = rec
    return { valid: true, record: safe }
  }

  /**
   * Rotate a refresh token: revoke the old, issue a new one for the same user/session lineage.
   * Returns the new opaque token.
   */
  async rotate(
    token: string,
    meta?: Record<string, unknown>
  ): Promise<RotationResult> {
    const rec = await this.loadRecordByToken(token)
    if (!rec) throw new Error('Invalid refresh token')
    if (rec.expiresAt <= Date.now()) {
      await this.revokeByHash(rec.userId, rec.tokenHash)
      throw new Error('Refresh token expired')
    }

    // Revoke old
    await this.revokeByHash(rec.userId, rec.tokenHash)

    // Issue new, increment rotation, keep same sessionId lineage (or choose to generate a new one)
    const newToken = randomToken(32)
    const newHash = await sha256Hex(newToken)
    const now = Date.now()
    const newRec: RefreshTokenRecord = {
      tokenHash: newHash,
      userId: rec.userId,
      sessionId: rec.sessionId, // keep session lineage; change if you want per-rotate sessionIds
      createdAt: now,
      expiresAt: now + this.ttlMs,
      rotation: rec.rotation + 1,
      meta: meta ?? rec.meta,
    }

    await this.saveRecord(newRec)
    await this.enforceMaxPerUser(rec.userId)

    return {
      token: newToken,
      sessionId: newRec.sessionId,
      expiresAt: newRec.expiresAt,
      rotatedFromSessionId: rec.sessionId,
    }
  }

  /**
   * Revoke a specific refresh token (by its opaque value).
   */
  async revoke(token: string): Promise<boolean> {
    const rec = await this.loadRecordByToken(token)
    if (!rec) return false
    await this.revokeByHash(rec.userId, rec.tokenHash)
    return true
  }

  /**
   * Revoke all active refresh tokens for a user (e.g., global sign-out).
   * Returns number of tokens revoked.
   */
  async revokeAllForUser(userId: string): Promise<number> {
    const setKey = this.kUserSet(userId)
    const hashes = await this.redis.smembers(setKey)
    if (!hashes?.length) return 0

    let n = 0
    for (const h of hashes) {
      const k = this.kToken(h)
      const raw = await this.redis.get(k)
      if (raw) {
        await this.redis.del(k)
        n++
      }
      await this.redis.srem(setKey, h)
    }
    return n
  }

  /**
   * List active (non-expired) sessions for a user (no tokens returned).
   */
  async listActive(
    userId: string
  ): Promise<Array<Omit<RefreshTokenRecord, 'tokenHash'>>> {
    const hashes = await this.redis.smembers(this.kUserSet(userId))
    const out: Array<Omit<RefreshTokenRecord, 'tokenHash'>> = []
    const now = Date.now()

    for (const h of hashes) {
      const raw = await this.redis.get(this.kToken(h))
      if (!raw) {
        await this.redis.srem(this.kUserSet(userId), h)
        continue
      }
      const rec = JSON.parse(raw) as RefreshTokenRecord
      if (rec.expiresAt > now) {
        const { tokenHash: _omit, ...safe } = rec
        out.push(safe)
      } else {
        // clean expired
        await this.redis.del(this.kToken(h))
        await this.redis.srem(this.kUserSet(userId), h)
      }
    }
    return out
  }

  // ── Internals ──────────────────────────────────────────────────────────────
  private async revokeByHash(userId: string, tokenHash: string): Promise<void> {
    await this.redis.del(this.kToken(tokenHash))
    await this.redis.srem(this.kUserSet(userId), tokenHash)
  }

  private async enforceMaxPerUser(userId: string): Promise<void> {
    if (!this.maxPerUser || this.maxPerUser <= 0) return

    // Fetch all hashes, sort by createdAt asc, trim oldest extras.
    const setKey = this.kUserSet(userId)
    const hashes = await this.redis.smembers(setKey)
    if (hashes.length <= this.maxPerUser) return

    const withCreated: Array<{ h: string; createdAt: number }> = []
    for (const h of hashes) {
      const raw = await this.redis.get(this.kToken(h))
      if (!raw) {
        await this.redis.srem(setKey, h)
        continue
      }
      try {
        const rec = JSON.parse(raw) as RefreshTokenRecord
        withCreated.push({ h, createdAt: rec.createdAt })
      } catch {
        // if parsing fails, drop it
        await this.redis.del(this.kToken(h))
        await this.redis.srem(setKey, h)
      }
    }

    withCreated.sort((a, b) => a.createdAt - b.createdAt)
    const toTrim = Math.max(withCreated.length - this.maxPerUser, 0)
    for (let i = 0; i < toTrim; i++) {
      const h = withCreated[i].h
      await this.redis.del(this.kToken(h))
      await this.redis.srem(setKey, h)
    }
  }
}

/**
 * Factory with env-driven defaults (uses bracket access for TS4111).
 */
export function makeRefreshTokenRepository(
  redis: RedisKvLike,
  opts?: Partial<RefreshTokenOptions>
) {
  const ttlMs = Number(
    opts?.ttlMs ?? process.env['REFRESH_TOKEN_TTL_MS'] ?? 2_592_000_000 // 30d
  )
  const prefix = opts?.prefix ?? process.env['REFRESH_TOKEN_PREFIX'] ?? 'rt'
  const maxPerUser =
    opts?.maxPerUser ??
    (process.env['REFRESH_TOKEN_MAX_PER_USER'] != null
      ? Number(process.env['REFRESH_TOKEN_MAX_PER_USER'])
      : undefined)

  return new RefreshTokenRepository(redis, { ttlMs, prefix, maxPerUser })
}
