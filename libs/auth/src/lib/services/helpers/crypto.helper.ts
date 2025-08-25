// libs/auth/src/lib/services/helpers/crypto.helper.ts
// -----------------------------------------------------------------------------
// Lightweight crypto helpers for the auth domain (Node.js standard library only)
// -----------------------------------------------------------------------------
// Why this file exists
//   • Keep common crypto utilities in one place (hashing, HMAC, base64url, HKDF)
//   • Avoid ad-hoc implementations spread across repositories
//   • Provide safe, well-documented primitives for token/cookie/signature work
//
// Non-goals
//   • JWT signing/verification (use `jose` or your TokenService for that)
//   • Password hashing (consider scrypt/argon2id; out of scope here)
//
// Node.js version
//   • Assumes Node 18+ (has `crypto.hkdfSync`, `crypto.randomUUID`, etc.)
// -----------------------------------------------------------------------------

import {
  createHash,
  createHmac,
  hkdfSync,
  randomBytes,
  timingSafeEqual
} from 'node:crypto'

/* -----------------------------------------------------------------------------
 * Shared input type (kept narrow to match Node's crypto BinaryLike nicely)
 * -----------------------------------------------------------------------------
 * We purposely avoid `ArrayBuffer` in public signatures because some @types/node
 * versions model BinaryLike as `string | Buffer | NodeJS.ArrayBufferView`.
 * `Uint8Array` is sufficient for zero-copy interop, and `Buffer` is ubiquitous.
 */
export type BytesLike = string | Buffer | Uint8Array

/** Normalize "bytes-like" inputs to a Buffer (no copies for Buffer inputs). */
function toBuffer(input: BytesLike): Buffer {
  if (typeof input === 'string') return Buffer.from(input, 'utf8')
  if (Buffer.isBuffer(input)) return input
  // Uint8Array (or any typed array)
  return Buffer.from(input.buffer, input.byteOffset, input.byteLength)
}

/* -----------------------------------------------------------------------------
 * Base64url helpers
 * -----------------------------------------------------------------------------
 * - JWTs, WebAuthn, and many web tokens use URL-safe Base64 ("base64url"):
 *   replace '+' → '-', '/' → '_', and remove '=' padding.
 */

/** Encode bytes/string to base64url (no padding). */
export function b64urlEncode(data: BytesLike): string {
  const b64 = toBuffer(data).toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

/** Decode base64url → Buffer. (Use `toString('utf8')` if you need a string.) */
export function b64urlDecode(data: string): Buffer {
  // Pad to multiple of 4 and convert back to standard base64
  const padLen = (4 - (data.length % 4)) % 4
  const padded = (data + '='.repeat(padLen))
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  return Buffer.from(padded, 'base64')
}

/* -----------------------------------------------------------------------------
 * Hashing (SHA-256)
 * -----------------------------------------------------------------------------
 * Common for OTP/PKCE/cache keys/signature preparation.
 */

/** SHA-256; choose output format: 'hex' | 'base64url' | 'buffer' (default: 'base64url'). */
export function sha256(
  data: BytesLike,
  out: 'hex' | 'base64url' | 'buffer' = 'base64url'
): string | Buffer {
  const digest = createHash('sha256').update(toBuffer(data)).digest()
  if (out === 'hex') return digest.toString('hex')
  if (out === 'buffer') return digest
  return b64urlEncode(digest)
}

/* -----------------------------------------------------------------------------
 * HMAC-SHA256 (sign + verify)
 * -----------------------------------------------------------------------------
 * Use HMAC when you need an unforgeable MAC under a shared secret (e.g., CSRF
 * tokens, signed URLs). Verification is constant-time to prevent timing leaks.
 */

/** Compute HMAC-SHA256 over `data` with `key`; output as 'hex' | 'base64url' | 'buffer'. */
export function hmacSha256(
  key: BytesLike,
  data: BytesLike,
  out: 'hex' | 'base64url' | 'buffer' = 'base64url'
): string | Buffer {
  const mac = createHmac('sha256', toBuffer(key))
    .update(toBuffer(data))
    .digest()
  if (out === 'hex') return mac.toString('hex')
  if (out === 'buffer') return mac
  return b64urlEncode(mac)
}

/**
 * Constant-time verification of an HMAC signature.
 * Strategy:
 *   - Compute the MAC (`computed`) for (key, data)
 *   - Hash both `computed` and `expectedSig` to fixed-length (32-byte) digests
 *   - Compare with `timingSafeEqual`
 *
 * Hashing to fixed length:
 *   - Avoids throwing when lengths differ
 *   - Reduces length-based side channels
 */
export function verifyHmacSha256(
  expectedSig: BytesLike,
  key: BytesLike,
  data: BytesLike
): boolean {
  const computed = hmacSha256(key, data, 'buffer') as Buffer
  const provided = toBuffer(expectedSig)
  const a = createHash('sha256').update(provided).digest()
  const b = createHash('sha256').update(computed).digest()
  return timingSafeEqual(a, b)
}

/* -----------------------------------------------------------------------------
 * Constant-time equality for arbitrary strings/bytes
 * -----------------------------------------------------------------------------
 * When you need to compare secrets (codes, tokens) without leaking timing info.
 * We hash both to fixed-size (SHA-256) and then use timingSafeEqual.
 */

export function safeEqual(a: BytesLike, b: BytesLike): boolean {
  const ah = createHash('sha256').update(toBuffer(a)).digest()
  const bh = createHash('sha256').update(toBuffer(b)).digest()
  return timingSafeEqual(ah, bh)
}

/* -----------------------------------------------------------------------------
 * Random tokens / ids
 * -----------------------------------------------------------------------------
 * - Use base64url for ID-safe tokens in URLs/headers/cookies.
 * - `randomId` lets you add a short prefix (e.g., "rt_", "csrf_", "kid_").
 */

/** Secure random token (base64url), `bytes` of entropy (default 32 → ~256 bits). */
export function randomToken(bytes = 32): string {
  return b64urlEncode(randomBytes(bytes))
}

/** Random id with optional prefix (e.g., "rt_", "csrf_", "kid_"). */
export function randomId(prefix = '', bytes = 16): string {
  const token = randomToken(bytes)
  return prefix ? `${prefix}${token}` : token
}

/* -----------------------------------------------------------------------------
 * HKDF-SHA256 (key derivation)
 * -----------------------------------------------------------------------------
 * Derive sub-keys from a master secret (IKM) with optional salt + info.
 * Useful for: per-purpose signing keys, cookie keys, envelope keys, etc.
 */

export function hkdfSha256(
  ikm: BytesLike,
  options: {
    salt?: BytesLike
    info?: BytesLike
    length: number // bytes of output key material (OKM)
    out?: 'buffer' | 'hex' | 'base64url'
  }
): Buffer | string {
  const salt = options.salt ? toBuffer(options.salt) : Buffer.alloc(0)
  const info = options.info ? toBuffer(options.info) : Buffer.alloc(0)
  const okm = hkdfSync('sha256', toBuffer(ikm), salt, info, options.length)
  if (options.out === 'hex') return Buffer.from(okm).toString('hex')
  if (options.out === 'base64url') return b64urlEncode(Buffer.from(okm))
  return Buffer.from(okm) // Buffer by default
}

/* -----------------------------------------------------------------------------
 * Convenience: channel-bound secrets (example pattern)
 * -----------------------------------------------------------------------------
 * In some flows you want a keyed hash that also binds a channel identifier,
 * like "origin" or "ip". You can use HKDF to derive per-channel keys.
 */

/** Derive a per-channel HMAC key; returns base64url for storage or Buffer if needed. */
export function deriveChannelKey(
  masterSecret: BytesLike,
  channelId: string, // e.g., hostname / origin / audience / route
  length = 32,
  out: 'buffer' | 'hex' | 'base64url' = 'base64url'
): Buffer | string {
  return hkdfSha256(masterSecret, {
    salt: 'helix:auth:hkdf',
    info: channelId,
    length,
    out
  })
}

/* -----------------------------------------------------------------------------
 * Small ergonomic helpers used around the codebase
 * -------------------------------------------------------------------------- */

/** Hash → base64url (handy alias when you need a compact fingerprint). */
export function sha256b64u(data: BytesLike): string {
  return sha256(data, 'base64url') as string
}

/** Constant-time equality for base64url strings (e.g., OTP/CSRF digests). */
export function safeEqualB64u(aB64u: string, bB64u: string): boolean {
  // Compare the underlying bytes in constant time
  return safeEqual(b64urlDecode(aB64u), b64urlDecode(bB64u))
}
