import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto'

/** Output encodings we commonly use. */
export type HashEncoding = 'hex' | 'base64url'

/** Convert a Buffer to base64url without padding. */
export function toBase64Url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

/** Convert a base64url string to Buffer. */
export function fromBase64Url(s: string): Buffer {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : ''
  return Buffer.from(b64 + pad, 'base64')
}

/** SHA-256 of input (utf8) → hex or base64url (default hex). */
export function sha256(
  input: string | Buffer,
  enc: HashEncoding = 'hex'
): string {
  const h = createHash('sha256').update(input).digest()
  return enc === 'hex' ? h.toString('hex') : toBase64Url(h)
}

/** HMAC-SHA256(msg, key) → hex or base64url (default hex). */
export function hmacSha256(
  key: string | Buffer,
  msg: string | Buffer,
  enc: HashEncoding = 'hex'
): string {
  const mac = createHmac('sha256', key).update(msg).digest()
  return enc === 'hex' ? mac.toString('hex') : toBase64Url(mac)
}

/** Cryptographically random ID (base64url, no padding). */
export function randomId(bytes = 32): string {
  return toBase64Url(randomBytes(bytes))
}

/**
 * Constant-time equality for secrets (strings/bytes).
 * If lengths differ, returns false without throwing.
 */
export function safeEqual(a: string | Buffer, b: string | Buffer): boolean {
  const A = typeof a === 'string' ? Buffer.from(a) : a
  const B = typeof b === 'string' ? Buffer.from(b) : b
  if (A.length !== B.length) return false
  try {
    return timingSafeEqual(A, B)
  } catch {
    return false
  }
}

/** Deterministic, canonical JSON stringify with stable key ordering. */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sortRec(value))
}

/** Hash any JSON-like value deterministically; optional salt prepended. */
export function hashObject(
  value: unknown,
  opts: { salt?: string; enc?: HashEncoding } = {}
): string {
  const s = opts.salt ? `${opts.salt}|` : ''
  return sha256(s + stableStringify(value), opts.enc ?? 'hex')
}

/** Normalize common IP forms (e.g., ::ffff:127.0.0.1, [::1]). */
export function normalizeIp(ip: string | null | undefined): string | null {
  if (!ip) return null
  let v = ip.trim()
  if (v.startsWith('::ffff:')) v = v.slice(7)
  if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1)
  return v
}

/** Fingerprint an IP address (normalized) with optional salt → hex/base64url. */
export function fingerprintIp(
  ip: string | null | undefined,
  opts: { salt?: string; enc?: HashEncoding } = {}
): string {
  const norm = normalizeIp(ip) ?? ''
  return sha256((opts.salt ? `${opts.salt}|` : '') + norm, opts.enc ?? 'hex')
}

/**
 * Lightweight device fingerprint from stable attributes.
 * Provide what you have; missing fields are OK.
 */
export function fingerprintDevice(
  input: {
    ua?: string | null
    ip?: string | null
    deviceId?: string | null // your own persisted device identifier (if any)
    platform?: string | null // OS/hardware hint if available
  },
  opts: { salt?: string; enc?: HashEncoding } = {}
): string {
  const parts = [
    input.deviceId ?? '',
    input.ua ?? '',
    normalizeIp(input.ip) ?? '',
    input.platform ?? '',
  ]
  const material = parts.join('|')
  const prefixed = (opts.salt ? `${opts.salt}|` : '') + material
  return sha256(prefixed, opts.enc ?? 'base64url')
}

/** Fingerprint a bearer/refresh token using HMAC for key separation. */
export function fingerprintToken(
  token: string,
  opts: { secret: string | Buffer; enc?: HashEncoding }
): string {
  return hmacSha256(opts.secret, token, opts.enc ?? 'base64url')
}

/** Create a deterministic ID from arbitrary parts (joined by ‘:’ then hashed). */
export function deterministicId(
  ...parts: Array<string | number | boolean | null | undefined>
): string {
  const s = parts.map((p) => (p == null ? '' : String(p))).join(':')
  return sha256(s, 'base64url')
}

// ─────────────────────────── internals ───────────────────────────

function sortRec<T = unknown>(val: T): any {
  if (val === null || typeof val !== 'object') return normalizeScalar(val)
  if (val instanceof Date) return val.toISOString()
  if (Array.isArray(val)) return val.map((x) => sortRec(x))
  const obj = val as Record<string, unknown>
  const keys = Object.keys(obj).sort()
  const out: Record<string, unknown> = {}
  for (const k of keys) out[k] = sortRec(obj[k])
  return out
}

function normalizeScalar(v: unknown): unknown {
  if (v === undefined) return null
  if (typeof v === 'bigint') return v.toString()
  if (typeof v === 'symbol') return v.toString()
  if (typeof v === 'function') return `[Function ${v.name || 'anonymous'}]`
  return v
}
