/* JSON helpers suitable for logs, Redis payloads, and audit metadata. */

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonObject | JsonArray
export interface JsonObject {
  [k: string]: JsonValue | undefined
}
export type JsonArray = Array<JsonValue>

export interface StringifyOptions {
  /** Pretty spaces (default 0 / compact). */
  space?: number
  /** Sort object keys for stable output (default false). */
  sortKeys?: boolean
  /** Cap the resulting JSON string to at most N bytes; returns a truncated placeholder if exceeded. */
  maxBytes?: number
  /** Custom replacer hook (applied after built-in safety wrapper). */
  replacer?: (this: any, key: string, value: unknown) => unknown
  /** Text to use when circular references are found. (default "[Circular]") */
  circularText?: string
}

export interface ParseOptions {
  /** Revive BigInt placeholders back to BigInt (default false → stays string). */
  reviveBigInt?: boolean
  /** Revive Buffer placeholders back to Buffer (default true in Node). */
  reviveBuffer?: boolean
  /** Custom reviver hook (applied after built-in reviver). */
  reviver?: (this: any, key: string, value: unknown) => unknown
}

/** Stringify with safe replacer: handles BigInt/Buffer/Date/Error, circular refs, key sorting, byte caps. */
export function stringify(value: unknown, opts: StringifyOptions = {}): string {
  const {
    space = 0,
    sortKeys = false,
    maxBytes,
    replacer,
    circularText = '[Circular]',
  } = opts

  const seen = new WeakMap<object, string>() // object → path
  const wrapReplacer = makeSafeReplacer({
    seen,
    circularText,
    userReplacer: replacer,
  })

  const toStr = (v: unknown): string => {
    try {
      const raw = sortKeys
        ? JSON.stringify(sortRec(v), wrapReplacer, space)
        : JSON.stringify(v, wrapReplacer, space)

      if (maxBytes && byteLen(raw) > maxBytes) {
        return makeTruncatedPlaceholder(raw, maxBytes)
      }
      return raw
    } catch {
      // Last-ditch fallback
      return `"${String(v)}"`
    }
  }

  return toStr(value)
}

/** Like stringify, but returns `{ ok, json }` instead of throwing on edge cases. */
export function safeStringify(
  value: unknown,
  opts?: StringifyOptions
): { ok: boolean; json: string } {
  try {
    return { ok: true, json: stringify(value, opts) }
  } catch (e) {
    return { ok: false, json: makeErrorPlaceholder(e) }
  }
}

/** Parse with optional revivers for BigInt/Buffer placeholders. */
export function parse<T = unknown>(text: string, opts: ParseOptions = {}): T {
  const revive = makeSafeReviver(opts)
  return JSON.parse(text, revive) as T
}

/** Try-parse helper that never throws. */
export function tryParse<T = unknown>(
  text: string,
  opts?: ParseOptions
): T | null {
  try {
    return parse<T>(text, opts)
  } catch {
    return null
  }
}

/** Heuristic: does this string *look* like JSON? (cheap preflight) */
export function isLikelyJson(s: string | null | undefined): boolean {
  if (!s) return false
  const t = s.trim()
  if (!t) return false
  const ch = t[0]
  return ch === '{' || ch === '[' || ch === '"'
}

/** Deep clone via JSON (uses safe stringify/parse; functions/undefined are dropped). */
export function jsonClone<T = unknown>(value: T): T {
  const s = stringify(value)
  return parse<T>(s)
}

/** Stable (key-sorted) stringify for hashing or cache keys. */
export function stableStringify(value: unknown, space = 0): string {
  return stringify(value, { sortKeys: true, space })
}

/** Byte length helper (UTF-8). */
export function byteLen(s: string): number {
  return Buffer.byteLength(s, 'utf8')
}

/** Create a truncated placeholder JSON when maxBytes is exceeded. */
function makeTruncatedPlaceholder(original: string, maxBytes: number): string {
  const previewBytes = Math.max(0, maxBytes - 80) // leave room for envelope
  const preview = sliceBytes(original, previewBytes)
  const payload = {
    __truncated__: true,
    approxBytes: byteLen(original),
    preview,
  }
  return JSON.stringify(payload)
}

/** Generic error placeholder JSON. */
function makeErrorPlaceholder(err: unknown): string {
  const e = err as any
  return JSON.stringify({
    __error__: true,
    name: e?.name || 'Error',
    message: e?.message || String(err),
  })
}

// ───────────────────────────── Replacers / Revivers ─────────────────────────────

/**
 * Safe replacer:
 *  - BigInt   → { "$bigint": "123" }
 *  - Buffer   → { "$b64": base64url }
 *  - Date     → ISO string (default JSON behavior is also ISO; we enforce it)
 *  - Error    → { name, message, stack }
 *  - Function → "[Function name]"
 *  - Circular → "[Circular]" (configurable)
 */
function makeSafeReplacer(args: {
  seen: WeakMap<object, string>
  circularText: string
  userReplacer?: (this: any, key: string, value: unknown) => unknown
}) {
  const { seen, circularText, userReplacer } = args

  // Track current object path to produce more useful circular hints if needed.
  const pathStack: string[] = []

  return function replacer(this: any, key: string, value: unknown): unknown {
    // Apply user replacer first if provided.
    if (userReplacer) {
      value = userReplacer.call(this, key, value)
    }

    // Drop undefined & functions by default (JSON behavior for undefined in objects).
    if (typeof value === 'function')
      return `[Function ${value.name || 'anonymous'}]`

    // Dates (ensure ISO explicitly)
    if (value instanceof Date) {
      return value.toISOString()
    }

    // Errors
    if (value instanceof Error) {
      return { name: value.name, message: value.message, stack: value.stack }
    }

    // BigInt (serialize as string)
    if (typeof value === 'bigint') {
      return { $bigint: value.toString() }
    }

    // Buffer
    if (isBuffer(value)) {
      return { $b64: toBase64Url(Buffer.from(value)) }
    }

    // Handle circular references
    if (value && typeof value === 'object') {
      const obj = value as object

      // Maintain a path (approximate): parentPath.key
      const parentPath = pathStack.length
        ? pathStack[pathStack.length - 1]
        : '$'
      const myPath = key ? `${parentPath}.${key}` : parentPath

      if (seen.has(obj)) {
        return args.circularText // or `${circularText}(${seen.get(obj)})`
      }
      seen.set(obj, myPath)
      pathStack.push(myPath)
      const out = obj // let JSON walk into children
      pathStack.pop()
      return out
    }

    return value
  }
}

/** Built-in reviver for placeholders produced by `makeSafeReplacer`. */
function makeSafeReviver(opts: ParseOptions) {
  const reviveBigInt = !!opts.reviveBigInt
  const reviveBuffer = opts.reviveBuffer !== false // default true (Node)
  const user = opts.reviver

  // Narrowing helpers that use *bracket* access (TS4111-safe).
  const isBigIntPlaceholder = (
    obj: Record<string, unknown>
  ): obj is { ['$bigint']: string } => typeof obj['$bigint'] === 'string'

  const isB64Placeholder = (
    obj: Record<string, unknown>
  ): obj is { ['$b64']: string } => typeof obj['$b64'] === 'string'

  return function reviver(this: any, key: string, value: unknown): unknown {
    if (user) {
      value = user.call(this, key, value)
    }
    // Try to detect our placeholder objects
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>
      // BigInt
      if (reviveBigInt && isBigIntPlaceholder(obj)) {
        try {
          return BigInt(obj['$bigint'])
        } catch {
          return obj['$bigint']
        }
      }
      // Buffer
      if (reviveBuffer && isB64Placeholder(obj)) {
        try {
          return fromBase64Url(obj['$b64'])
        } catch {
          return obj['$b64']
        }
      }
    }
    return value
  }
}

// ───────────────────────────── Utilities ─────────────────────────────

/** Stable sort object keys recursively. */
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
  if (typeof v === 'bigint') return { $bigint: v.toString() }
  if (typeof v === 'symbol') return v.toString()
  if (typeof v === 'function') return `[Function ${v.name || 'anonymous'}]`
  return v
}

function isBuffer(v: unknown): v is Buffer {
  return (
    typeof Buffer !== 'undefined' &&
    v != null &&
    (v as any).constructor != null &&
    typeof (v as any).constructor.isBuffer === 'function' &&
    (v as any).constructor.isBuffer(v)
  )
}

/** Slice a UTF-8 string to at most N bytes without throwing (may cut mid-codepoint). */
function sliceBytes(s: string, maxBytes: number): string {
  if (byteLen(s) <= maxBytes) return s
  const buf = Buffer.from(s, 'utf8')
  return buf.slice(0, Math.max(0, maxBytes)).toString('utf8')
}

/** Base64url helpers (no padding). */
function toBase64Url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(s: string): Buffer {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : ''
  return Buffer.from(b64 + pad, 'base64')
}
