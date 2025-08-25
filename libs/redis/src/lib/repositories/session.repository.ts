// libs/redis/src/lib/repositories/session.repository.ts

// JSON helpers (portable, no DOM types)
export type JSONPrimitive = string | number | boolean | null
export type JSONValue = JSONPrimitive | { [k: string]: JSONValue } | JSONValue[]

// Minimal Redis interface we depend on (works with ioredis or redis@4)
export type RedisLike = {
  get(key: string): Promise<string | null>
  set(
    key: string,
    value: string,
    mode?: 'EX' | 'PX',
    duration?: number
  ): Promise<'OK' | null>
  del(key: string): Promise<number>
  expire(key: string, seconds: number): Promise<number>
  ttl(key: string): Promise<number>
  sadd(key: string, ...members: string[]): Promise<number>
  srem(key: string, ...members: string[]): Promise<number>
  smembers(key: string): Promise<string[]>
}

export interface SessionCreate {
  uid: string
  ip?: string | null
  ua?: string | null
  meta?: Record<string, JSONValue>
  ttlSeconds?: number
}

export interface SessionRecord {
  sid: string
  uid: string
  issuedAt: number // epoch seconds
  expiresAt: number // epoch seconds
  ip?: string | null
  ua?: string | null
  meta?: Record<string, JSONValue>
}

export type SessionRepoOptions = {
  prefix?: string
  defaultTTLSeconds?: number
  idFactory?: () => string // override for tests
}

// Env with bracket access (avoids TS4111 index-signature warnings)
const DEFAULT_TTL =
  Number.parseInt(globalThis.process?.env?.['SESSION_TTL_SECONDS'] ?? '', 10) ||
  60 * 60 * 24 * 30 // 30 days
const DEFAULT_PREFIX = globalThis.process?.env?.['REDIS_PREFIX'] ?? 'helix'

// Reasonably unique id without assuming Node's crypto in all runtimes
function defaultIdFactory(): string {
  const g: any = globalThis as any
  if (g.crypto && typeof g.crypto.randomUUID === 'function') {
    return g.crypto.randomUUID()
  }
  // Pseudo-UUID fallback
  const a = Math.random().toString(36).slice(2)
  const b = Date.now().toString(36)
  const c = Math.random().toString(36).slice(2)
  return `sid_${a}${b}${c}`
}

function keySession(prefix: string, sid: string) {
  return `${prefix}:session:${sid}`
}
function keyUserIndex(prefix: string, uid: string) {
  return `${prefix}:user:${uid}:sessions`
}

function nowSec() {
  return Math.floor(Date.now() / 1000)
}

function encode(rec: SessionRecord): string {
  return JSON.stringify(rec)
}
function decode(json: string | null): SessionRecord | null {
  if (!json) return null
  try {
    const o = JSON.parse(json)
    if (
      typeof o?.sid === 'string' &&
      typeof o?.uid === 'string' &&
      typeof o?.issuedAt === 'number'
    ) {
      return o as SessionRecord
    }
    return null
  } catch {
    return null
  }
}

export class SessionRepository {
  private readonly r: RedisLike
  private readonly prefix: string
  private readonly defaultTTL: number
  private readonly makeId: () => string

  constructor(redis: RedisLike, opts: SessionRepoOptions = {}) {
    this.r = redis
    this.prefix = opts.prefix ?? DEFAULT_PREFIX
    this.defaultTTL = opts.defaultTTLSeconds ?? DEFAULT_TTL
    this.makeId = opts.idFactory ?? defaultIdFactory
  }

  /** Create and persist a new session */
  async create(input: SessionCreate): Promise<SessionRecord> {
    const sid = this.makeId()
    const issuedAt = nowSec()
    const ttl = input.ttlSeconds ?? this.defaultTTL
    const expiresAt = issuedAt + ttl

    const rec: SessionRecord = {
      sid,
      uid: input.uid,
      issuedAt,
      expiresAt,
      ip: input.ip ?? null,
      ua: input.ua ?? null,
      meta: input.meta ?? {},
    }

    const sKey = keySession(this.prefix, sid)
    const uKey = keyUserIndex(this.prefix, input.uid)

    // Compatible "EX seconds" form for both ioredis and redis@4
    await this.r.set(sKey, encode(rec), 'EX', ttl)
    await this.r.sadd(uKey, sid)
    // Keep the index alive at least as long as the longest session
    await this.r.expire(uKey, Math.max(ttl, 86400)) // at least 1 day

    return rec
  }

  async get(sid: string): Promise<SessionRecord | null> {
    const json = await this.r.get(keySession(this.prefix, sid))
    return decode(json)
  }

  /** Delete one session id */
  async delete(sid: string): Promise<void> {
    const rec = await this.get(sid)
    await this.r.del(keySession(this.prefix, sid))
    if (rec) {
      await this.r.srem(keyUserIndex(this.prefix, rec.uid), sid)
    }
  }

  /** Extend TTL and update expiresAt; returns updated record or null */
  async touch(sid: string, ttlSeconds?: number): Promise<SessionRecord | null> {
    const rec = await this.get(sid)
    if (!rec) return null

    const ttl = ttlSeconds ?? this.defaultTTL
    rec.expiresAt = nowSec() + ttl

    const sKey = keySession(this.prefix, sid)
    await this.r.set(sKey, encode(rec), 'EX', ttl)
    await this.r.expire(
      keyUserIndex(this.prefix, rec.uid),
      Math.max(ttl, 86400)
    )
    return rec
  }

  /** Rotate session id (new sid, same user/meta); old id removed */
  async rotate(
    oldSid: string,
    ttlSeconds?: number
  ): Promise<SessionRecord | null> {
    const existing = await this.get(oldSid)
    if (!existing) return null

    const rec = await this.create({
      uid: existing.uid,
      ip: existing.ip ?? undefined,
      ua: existing.ua ?? undefined,
      meta: existing.meta,
      ttlSeconds,
    })

    await this.delete(oldSid)
    return rec
  }

  /** Set of session ids for the user (may include expired if index outlives individual keys) */
  async listUserSessionIds(uid: string): Promise<string[]> {
    return this.r.smembers(keyUserIndex(this.prefix, uid))
  }

  /** Revoke all sessions for a user, optionally keeping one sid */
  async revokeUser(
    uid: string,
    opts: { exceptSid?: string } = {}
  ): Promise<number> {
    const ids = await this.listUserSessionIds(uid)
    let count = 0
    await Promise.all(
      ids.map(async (sid) => {
        if (opts.exceptSid && sid === opts.exceptSid) return
        await this.delete(sid)
        count++
      })
    )
    return count
  }

  /** Seconds until expiry for this sid (Redis TTL semantics) */
  async ttl(sid: string): Promise<number> {
    return this.r.ttl(keySession(this.prefix, sid))
  }
}
