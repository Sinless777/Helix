import type { Milliseconds, Seconds } from '../redis.types'
import { milliseconds as ms, seconds as s } from '../redis.constants'

export type TimeUnit = 'ms' | 's' | 'm' | 'h' | 'd'
export type RoundMode = 'ceil' | 'floor' | 'round'

/** Common small constants. */
export const ONE_SECOND: Seconds = s(1)
export const ZERO_SECONDS: Seconds = s(0)
/** Prefer `undefined` to mean “no TTL”; but ZERO_SECONDS can be used when callers need a numeric. */
export const NO_TTL: Seconds = ZERO_SECONDS

/* ───────────────────────────── Conversions ───────────────────────────── */

/** Convert seconds → milliseconds (brands result). */
export function secondsToMs(value: Seconds | number): Milliseconds {
  return ms(Math.max(0, Math.floor(Number(value) * 1000)))
}

/** Convert milliseconds → seconds with configurable rounding (brands result). */
export function msToSeconds(
  value: Milliseconds | number,
  round: RoundMode = 'ceil'
): Seconds {
  const n = Math.max(0, Number(value) / 1000)
  const v =
    round === 'floor'
      ? Math.floor(n)
      : round === 'round'
        ? Math.round(n)
        : Math.ceil(n)
  return s(v)
}

/* ───────────────────────────── Parsing ─────────────────────────────
   Supports:  "500ms", "30s", "15m", "2h", "1d", and combos like "1h30m".
   If a plain number is provided, `defaultUnit` determines interpretation.
-------------------------------------------------------------------- */

export interface ParseOptions {
  defaultUnit?: TimeUnit // default 's'
}

/** Parse a duration string/number into both ms and s (branded). */
export function parseDuration(
  input: string | number,
  opts: ParseOptions = {}
): { ms: Milliseconds; s: Seconds } {
  const defaultUnit: TimeUnit = opts.defaultUnit ?? 's'

  if (typeof input === 'number' && Number.isFinite(input)) {
    return interpretNumber(input, defaultUnit)
  }

  const raw = String(input).trim()
  if (!raw) return { ms: ms(0), s: s(0) }

  // If it's a plain number (e.g., "30"), interpret by defaultUnit.
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    return interpretNumber(Number(raw), defaultUnit)
  }

  // Tokenize like "2h30m", "1d 2h 10m 5s 250ms"
  const re = /(-?\d+(?:\.\d+)?)(ms|s|m|h|d)/gi
  let match: RegExpExecArray | null
  let totalMs = 0

  while ((match = re.exec(raw))) {
    const val = Number(match[1])
    const unit = match[2].toLowerCase() as TimeUnit
    totalMs += unitToMs(val, unit)
  }

  // If nothing matched (e.g., stray text), fall back to 0.
  if (totalMs === 0 && !re.lastIndex) {
    return { ms: ms(0), s: s(0) }
  }

  totalMs = Math.max(0, Math.floor(totalMs))
  return { ms: ms(totalMs), s: msToSeconds(totalMs, 'ceil') }
}

/** Convert any TTL-ish input into seconds (brands result). */
export function ttlSeconds(
  input: string | number | Seconds | Milliseconds,
  round: RoundMode = 'ceil',
  defaultUnit: TimeUnit = 's'
): Seconds {
  if (typeof input === 'string' || typeof input === 'number') {
    const parsed = parseDuration(input as string | number, { defaultUnit })
    return msToSeconds(parsed.ms, round)
  }
  // Already branded numeric
  // Heuristic: values >= 1000 very likely ms; below are seconds.
  const n = Number(input)
  if (n >= 1000) return msToSeconds(n as Milliseconds, round)
  return s(
    Math.max(
      0,
      Math[round === 'ceil' ? 'ceil' : round === 'floor' ? 'floor' : 'round'](n)
    )
  )
}

/** Convert any TTL-ish input into milliseconds (brands result). */
export function ttlMs(
  input: string | number | Seconds | Milliseconds,
  defaultUnit: TimeUnit = 's'
): Milliseconds {
  if (typeof input === 'string' || typeof input === 'number') {
    return parseDuration(input as string | number, { defaultUnit }).ms
  }
  const n = Number(input)
  // Heuristic: values < 1000 are probably seconds; convert to ms.
  return n < 1000 ? secondsToMs(n as Seconds) : ms(Math.max(0, Math.floor(n)))
}

/* ───────────────────────────── Math helpers ───────────────────────────── */

/** Clamp a seconds TTL to [min,max] (brands result). */
export function clampSeconds(
  ttl: Seconds | number,
  min: Seconds | number = 0,
  max?: Seconds | number
): Seconds {
  const v = Math.max(0, Number(ttl))
  const lo = Math.max(0, Number(min))
  const hi = typeof max === 'number' ? Math.max(lo, Number(max)) : undefined
  const out = hi !== undefined ? Math.min(Math.max(v, lo), hi) : Math.max(v, lo)
  return s(out)
}

/** Clamp a milliseconds TTL to [min,max] (brands result). */
export function clampMs(
  ttl: Milliseconds | number,
  min: Milliseconds | number = 0,
  max?: Milliseconds | number
): Milliseconds {
  const v = Math.max(0, Number(ttl))
  const lo = Math.max(0, Number(min))
  const hi = typeof max === 'number' ? Math.max(lo, Number(max)) : undefined
  const out = hi !== undefined ? Math.min(Math.max(v, lo), hi) : Math.max(v, lo)
  return ms(out)
}

/** Compute duration until a Date (past dates → 0). */
export function until(
  date: Date,
  nowMs: Milliseconds | number = Date.now(),
  round: RoundMode = 'ceil'
): { ms: Milliseconds; s: Seconds } {
  const diff = Math.max(0, date.getTime() - Number(nowMs))
  return { ms: ms(diff), s: msToSeconds(diff, round) }
}

/** Compute an absolute expiry Date from a TTL input. */
export function expiresAtFromNow(
  ttl: string | number | Seconds | Milliseconds,
  nowMs: number = Date.now()
): Date {
  const durMs = ttlMs(ttl)
  return new Date(nowMs + Number(durMs))
}

/** Check if a Date has passed. */
export function isExpired(at: Date, nowMs: number = Date.now()): boolean {
  return at.getTime() <= nowMs
}

/** Human-friendly rendering like "1d 2h 3m 4s". */
export function humanizeMs(value: Milliseconds | number): string {
  let msLeft = Math.max(0, Math.floor(Number(value)))
  const parts: string[] = []
  const DAY = 86_400_000
  const HOUR = 3_600_000
  const MIN = 60_000
  const SEC = 1_000

  const push = (n: number, label: string) => {
    if (n > 0) parts.push(`${n}${label}`)
  }

  const d = Math.floor(msLeft / DAY)
  msLeft -= d * DAY
  push(d, 'd')
  const h = Math.floor(msLeft / HOUR)
  msLeft -= h * HOUR
  push(h, 'h')
  const m = Math.floor(msLeft / MIN)
  msLeft -= m * MIN
  push(m, 'm')
  const sec = Math.floor(msLeft / SEC)
  msLeft -= sec * SEC
  push(sec, 's')

  if (parts.length === 0) return '0s'
  return parts.join(' ')
}

/* ───────────────────────────── internals ───────────────────────────── */

function interpretNumber(
  n: number,
  unit: TimeUnit
): { ms: Milliseconds; s: Seconds } {
  const totalMs = Math.max(0, Math.floor(unitToMs(n, unit)))
  return { ms: ms(totalMs), s: msToSeconds(totalMs, 'ceil') }
}

function unitToMs(v: number, unit: TimeUnit): number {
  const n = Number(v)
  switch (unit) {
    case 'ms':
      return n
    case 's':
      return n * 1000
    case 'm':
      return n * 60 * 1000
    case 'h':
      return n * 60 * 60 * 1000
    case 'd':
      return n * 24 * 60 * 60 * 1000
    default:
      return 0
  }
}
