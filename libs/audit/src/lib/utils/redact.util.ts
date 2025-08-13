import { RedactFn } from '../types/audit.types'
import {
  DEFAULT_REDACT_KEYS,
  DEFAULT_REDACT_QUERY_PARAMS,
  REDACT_REPLACEMENT,
} from '../constants'

/**
 * Redact arbitrary input using dot-path keys (e.g., "credentials.password").
 * - Does NOT mutate the original value; returns a deep-cloned sanitized value.
 * - Arrays are traversed; every element is checked for matching paths.
 */
export function redactValue(
  input: unknown,
  keys: ReadonlyArray<string> = DEFAULT_REDACT_KEYS as unknown as ReadonlyArray<string>,
  replacement: string = REDACT_REPLACEMENT
): unknown {
  if (!keys || keys.length === 0) return deepClone(input)
  const clone = deepClone(input)

  // Normalize and apply each path
  for (const raw of keys) {
    const path = String(raw || '')
      .split('.')
      .map((p) => p.trim())
      .filter(Boolean)
    if (!path.length) continue
    maskPath(clone as any, path, replacement)
  }
  return clone
}

/**
 * A `RedactFn` compatible export you can inject/use elsewhere.
 * Equivalent to `redactValue(input, keys, replacement)`.
 */
export const redact: RedactFn = (input, keys, replacement) =>
  redactValue(input, keys, replacement)

/**
 * Redact headers in a case-insensitive way.
 * - Returns a new object with lower-cased header names.
 * - Values are coerced to strings and masked when key matches.
 */
export function redactHeaders(
  headers: Record<string, unknown> | undefined | null,
  keys: ReadonlyArray<string> = [
    'authorization',
    'cookie',
    'set-cookie',
    'x-api-key',
    'x-auth-token',
    'x-forwarded-for', // sometimes contains PII chains
    ...(DEFAULT_REDACT_KEYS as unknown as string[]),
  ],
  replacement: string = REDACT_REPLACEMENT
): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {}
  if (!headers) return out

  const keySet = new Set(keys.map((k) => k.toLowerCase()))
  for (const k of Object.keys(headers)) {
    const lower = k.toLowerCase()
    const v = (headers as any)[k]
    if (keySet.has(lower)) {
      out[lower] = Array.isArray(v) ? v.map(() => replacement) : replacement
    } else {
      out[lower] = Array.isArray(v) ? v.map(stringify) : stringify(v)
    }
  }
  return out
}

/**
 * Redact query params by name; returns a new plain object.
 */
export function redactQuery(
  query: Record<string, unknown> | URLSearchParams | undefined | null,
  keys: ReadonlyArray<string> = DEFAULT_REDACT_QUERY_PARAMS as unknown as ReadonlyArray<string>,
  replacement: string = REDACT_REPLACEMENT
): Record<string, string | string[]> {
  const keySet = new Set(keys.map((k) => k.toLowerCase()))
  const out: Record<string, string | string[]> = {}

  if (!query) return out

  if (query instanceof URLSearchParams) {
    for (const [k, v] of query.entries()) {
      out[k] = keySet.has(k.toLowerCase()) ? replacement : v
    }
    return out
  }

  for (const k of Object.keys(query)) {
    const v = (query as any)[k]
    if (keySet.has(k.toLowerCase())) {
      out[k] = Array.isArray(v) ? v.map(() => replacement) : replacement
    } else {
      out[k] = Array.isArray(v) ? v.map(stringify) : stringify(v)
    }
  }
  return out
}

/**
 * Scrub a URL’s query string by masking selected parameter names.
 * Returns the redacted URL string; on parse error, returns the input.
 */
export function scrubUrl(
  inputUrl: string,
  keys: ReadonlyArray<string> = DEFAULT_REDACT_QUERY_PARAMS as unknown as ReadonlyArray<string>,
  replacement: string = REDACT_REPLACEMENT
): string {
  try {
    const u = new URL(inputUrl, 'http://_fallback-origin_') // base for relative URLs
    const keySet = new Set(keys.map((k) => k.toLowerCase()))
    const sp = u.searchParams
    for (const k of Array.from(sp.keys())) {
      if (keySet.has(k.toLowerCase())) {
        sp.set(k, replacement)
      }
    }
    // If a fake base was used, strip it back out for relative inputs
    if (inputUrl.startsWith('http://') || inputUrl.startsWith('https://')) {
      return u.toString()
    }
    return `${u.pathname}${sp.toString() ? `?${sp.toString()}` : ''}${u.hash ?? ''}`
  } catch {
    return inputUrl
  }
}

/**
 * General-purpose string masker, preserving a small prefix/suffix for UX.
 * e.g., maskString("sk_live_ABCDEF", 6, 2) → "sk_live_******EF"
 */
export function maskString(
  value: string,
  visibleStart = 2,
  visibleEnd = 2,
  maskChar = '*'
): string {
  const s = String(value ?? '')
  if (s.length <= visibleStart + visibleEnd)
    return maskChar.repeat(Math.max(3, s.length))
  const start = s.slice(0, visibleStart)
  const end = s.slice(-visibleEnd)
  return `${start}${maskChar.repeat(s.length - visibleStart - visibleEnd)}${end}`
}

/**
 * Token-aware masker: tries to keep known prefixes (e.g., "sk-", "rk_", "ghp_")
 * while masking the secret body.
 */
export function maskTokenLike(value: string): string {
  const v = String(value ?? '')
  const prefixMatch = v.match(/^([a-z]{2,4}[-_][a-z]{0,4}[_-]?)/i) // e.g., sk-, rk_, ghp_
  if (prefixMatch) {
    const p = prefixMatch[0]
    return `${p}${maskString(v.slice(p.length), 1, 2)}`
  }
  // JWTs ("eyJ...") → keep header alg hint only
  if (/^eyJ[A-Za-z0-9_-]*\./.test(v)) {
    return `${v.slice(0, 10)}...${v.slice(-3)}`
  }
  return maskString(v, 2, 2)
}

// ───────────────────────────── internals ─────────────────────────────

/** Deep clone to plain JSON-like structures, preserving arrays and Dates (ISO). */
function deepClone<T>(input: T): any {
  if (input === null || typeof input !== 'object') return normalizeScalar(input)
  if (input instanceof Date) return input.toISOString()
  if (input instanceof Error)
    return { name: input.name, message: input.message, stack: input.stack }
  if (Array.isArray(input)) return input.map((x) => deepClone(x))
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(input as Record<string, unknown>)) {
    out[k] = deepClone((input as any)[k])
  }
  return out
}

/** Replace the value at a dot-path with a replacement token (arrays supported). */
function maskPath(obj: any, parts: string[], replacement: string): void {
  if (!obj || typeof obj !== 'object') return
  if (parts.length === 0) return
  const [head, ...tail] = parts

  if (Array.isArray(obj)) {
    for (const item of obj) maskPath(item, parts, replacement)
    return
  }

  if (!(head in obj)) return
  if (tail.length === 0) {
    obj[head] =
      typeof obj[head] === 'string'
        ? maskTokenLike(String(obj[head]))
        : replacement
    return
  }
  maskPath(obj[head], tail, replacement)
}

/** Normalize scalars for cloning/stringifying. */
function normalizeScalar(v: unknown): unknown {
  if (v === undefined) return null
  if (typeof v === 'bigint') return v.toString()
  if (typeof v === 'symbol') return v.toString()
  if (typeof v === 'function') return `[Function ${v.name || 'anonymous'}]`
  if (v instanceof Date) return v.toISOString()
  return v
}

function stringify(v: unknown): string {
  if (v == null) return ''
  if (Array.isArray(v)) return v.map(stringify).join(', ')
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v)
    } catch {
      return '[object]'
    }
  }
  return String(v)
}
