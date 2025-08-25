import { AuditDiff, JsonValue, RedactFn } from '../types/audit.types'

export interface DiffOptions {
  /** Keys to redact (dot paths supported: "credentials.password"). */
  redactKeys?: ReadonlyArray<string>
  /** Custom redaction function. If omitted, a basic redacter is used. */
  redact?: RedactFn
  /** Max bytes (UTF-8) allowed for the serialized diff; beyond this we truncate. */
  maxBytes?: number
  /** Replacement string for masked values. */
  replacement?: string
  /** Include a simplified RFC6902 patch (objects only; arrays replaced wholesale). */
  computePatch?: boolean
}

/**
 * Compute a diff suitable for storage in `audit_log`.
 * - Redacts sensitive keys first (if configured)
 * - Builds a stable JSON representation for consistent byte sizing
 * - Caps overall size (sets `truncated: true` when applied)
 * - Optionally emits a simple JSON Patch for object changes
 */
export function makeAuditDiff(
  before?: unknown,
  after?: unknown,
  opts: DiffOptions = {}
): AuditDiff {
  const {
    redactKeys = [],
    redact,
    maxBytes = 64 * 1024, // 64KB sane default (align with constants if desired)
    replacement = '***',
    computePatch = true,
  } = opts

  // 1) Normalize + redact + stabilize structures
  const normBefore = stabilize(
    redactValue(before, redactKeys, replacement, redact)
  )
  const normAfter = stabilize(
    redactValue(after, redactKeys, replacement, redact)
  )

  // 2) Build optional JSON Patch
  const jsonPatch = computePatch
    ? buildJsonPatch(normBefore, normAfter)
    : undefined

  // 3) Size and cap
  const result: AuditDiff = { before: normBefore, after: normAfter, jsonPatch }
  const serialized = stableStringify(result)
  const bytes = utf8Length(serialized)
  result.bytes = bytes

  if (bytes > maxBytes) {
    // Truncate by progressively dropping the heaviest parts first.
    result.truncated = true

    // Try dropping JSON Patch first
    if (result.jsonPatch) {
      delete result.jsonPatch
    }

    // If still too big, drop before snapshot (keep "after" as the important state)
    let s2 = stableStringify(result)
    if (utf8Length(s2) > maxBytes) {
      delete result.before
      s2 = stableStringify(result)
    }

    // If still too big, drop after snapshot too, but keep a tiny marker
    if (utf8Length(s2) > maxBytes) {
      delete result.after
      // Keep only a tiny metadata note
      ;(result as any).note = 'diff omitted due to size'
    }

    // Recompute final size
    result.bytes = utf8Length(stableStringify(result))
  }

  return result
}

// ───────────────────────────── helpers ─────────────────────────────

/** Stable stringify (sorted keys) for consistent byte counting. */
export function stableStringify(v: unknown): string {
  const seen = new WeakSet<object>()
  return JSON.stringify(
    v,
    (_k, value) => {
      if (value && typeof value === 'object') {
        if (seen.has(value as object)) return '[Circular]'
        seen.add(value as object)
      }
      if (Array.isArray(value)) {
        return value.map((x) => normalizeScalar(x))
      }
      if (value && typeof value === 'object') {
        const obj = value as Record<string, unknown>
        const sorted = Object.keys(obj)
          .sort()
          .reduce<Record<string, unknown>>((acc, key) => {
            acc[key] = normalizeScalar(obj[key])
            return acc
          }, {})
        return sorted
      }
      return normalizeScalar(value)
    },
    2
  )
}

/** Normalize scalars: drop undefined; convert bigint/symbol/functions safely. */
function normalizeScalar(v: unknown): unknown {
  if (v === undefined) return null
  if (typeof v === 'bigint') return v.toString()
  if (typeof v === 'symbol') return v.toString()
  if (typeof v === 'function') return `[Function ${v.name || 'anonymous'}]`
  if (v instanceof Date) return v.toISOString()
  if (v instanceof Error) {
    return { name: v.name, message: v.message, stack: v.stack }
  }
  return v
}

/** Create a deep, stable structure with sorted keys and no undefineds. */
function stabilize<T>(input: T): JsonValue {
  return pruneUndefined(deepClone(input)) as JsonValue
}

/** Deep clone that turns Dates/Errors into plain values and preserves arrays. */
function deepClone<T>(input: T): any {
  if (input === null || typeof input !== 'object') return normalizeScalar(input)
  if (input instanceof Date) return input.toISOString()
  if (input instanceof Error)
    return { name: input.name, message: input.message, stack: input.stack }

  if (Array.isArray(input)) {
    return input.map((x) => deepClone(x))
  }

  const out: Record<string, unknown> = {}
  for (const k of Object.keys(input as Record<string, unknown>)) {
    out[k] = deepClone((input as any)[k])
  }
  return out
}

/** Remove undefined properties recursively. */
function pruneUndefined<T>(input: T): T {
  if (input === null || typeof input !== 'object') return input
  if (Array.isArray(input)) {
    return input.map((x) => pruneUndefined(x)) as any
  }
  const obj = input as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(obj)) {
    const v = obj[k]
    if (v !== undefined) out[k] = pruneUndefined(v)
  }
  return out as T
}

/** UTF-8 byte length for Node & browser. */
function utf8Length(s: string): number {
  if (typeof Buffer !== 'undefined') return Buffer.byteLength(s, 'utf8')
  if (typeof TextEncoder !== 'undefined')
    return new TextEncoder().encode(s).length
  // Worst-case fallback
  return unescape(encodeURIComponent(s)).length
}

// ───────────────────────────── redaction ─────────────────────────────

/** Basic redacter that supports dot-paths; can be overridden via opts.redact. */
function defaultRedact(
  input: unknown,
  keys: ReadonlyArray<string>,
  replacement: string
): unknown {
  if (!keys.length) return input
  const clone = deepClone(input)

  for (const path of keys) {
    if (!path) continue
    const parts = String(path)
      .split('.')
      .map((p) => p.trim())
      .filter(Boolean)
    maskPath(clone as any, parts, replacement)
  }
  return clone
}

function maskPath(obj: any, parts: string[], replacement: string): void {
  if (!obj || typeof obj !== 'object') return
  if (parts.length === 0) return
  const [head, ...tail] = parts

  if (Array.isArray(obj)) {
    for (const item of obj) {
      maskPath(item, parts, replacement)
    }
    return
  }

  if (!(head in obj)) return
  if (tail.length === 0) {
    obj[head] = replacement
    return
  }
  maskPath(obj[head], tail, replacement)
}

function redactValue(
  input: unknown,
  keys: ReadonlyArray<string>,
  replacement: string,
  redacter?: RedactFn
): unknown {
  const fn = redacter ?? defaultRedact
  try {
    return fn(input, keys, replacement)
  } catch {
    // Fail-closed: if custom redacter throws, drop the value rather than leak.
    return '[redaction-error]'
  }
}

// ───────────────────────────── json patch ─────────────────────────────

/**
 * Build a simplified RFC6902-like patch:
 * - For primitives/type changes: single "replace" op
 * - For objects: recurse per key, emitting add/remove/replace
 * - For arrays: treat as replaced wholesale (keeps patch smaller/simpler)
 */
export function buildJsonPatch(
  before: unknown,
  after: unknown,
  basePath = ''
):
  | Array<{
      op: 'add' | 'remove' | 'replace'
      path: string
      value?: JsonValue
    }>
  | undefined {
  if (isEqual(before, after)) return []

  const path = (p: string) => (p ? p : '/')

  // If types differ or either is primitive (including null), replace
  if (
    !isObject(before) ||
    !isObject(after) ||
    Array.isArray(before) ||
    Array.isArray(after)
  ) {
    return [{ op: 'replace', path: path(basePath), value: stabilize(after) }]
  }

  // Objects: compare per key
  const ops: Array<{
    op: 'add' | 'remove' | 'replace'
    path: string
    value?: JsonValue
  }> = []
  const a = before as Record<string, unknown>
  const b = after as Record<string, unknown>

  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const k of Array.from(keys).sort()) {
    const p = basePath + '/' + escapeJsonPointer(k)
    if (!(k in b)) {
      ops.push({ op: 'remove', path: p })
    } else if (!(k in a)) {
      ops.push({ op: 'add', path: p, value: stabilize(b[k]) })
    } else if (!isEqual(a[k], b[k])) {
      const child = buildJsonPatch(a[k], b[k], p)
      if (
        child &&
        child.length === 1 &&
        child[0].op === 'replace' &&
        child[0].path === p
      ) {
        // Collapse single replace
        ops.push(child[0])
      } else if (child && child.length) {
        // For nested object diffs, emit as a single replace to keep patch concise
        // (Alternatively, you could concat child, but size grows quickly.)
        ops.push({ op: 'replace', path: p, value: stabilize(b[k]) })
      }
    }
  }
  return ops
}

function escapeJsonPointer(segment: string): string {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1')
}

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  // Handle Dates
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  // Handle primitives and null
  if (a === null || b === null) return a === b
  if (typeof a !== 'object' || typeof b !== 'object') return false
  // Arrays: cheap check → stringify stable
  if (Array.isArray(a) || Array.isArray(b)) {
    return stableStringify(a) === stableStringify(b)
  }
  // Objects: shallow key+value compare; fallback to stable stringify for safety
  const ak = Object.keys(a as Record<string, unknown>)
  const bk = Object.keys(b as Record<string, unknown>)
  if (ak.length !== bk.length) return false
  for (const k of ak) {
    if (!Object.prototype.hasOwnProperty.call(b as object, k)) return false
    // Shallow compare; if not equal, bail
    if ((a as any)[k] === (b as any)[k]) continue
    // For correctness, fallback to stable stringify of each property
    if (stableStringify((a as any)[k]) !== stableStringify((b as any)[k]))
      return false
  }
  return true
}
