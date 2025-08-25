import { KEY_PREFIX, KEY_NS } from '../redis.constants'
import type { KeyBuild, KeyNamespace } from '../redis.types'
import { deterministicId } from './hash.util'

/**
 * Separator used for hierarchical key parts.
 * e.g., helix:session:{user123}:abc123
 */
export const KEY_SEP = ':'

/**
 * Wrap a value in Redis Cluster hash tags so all keys sharing the same
 * tag land in the same hash slot (enables multi-key ops in cluster).
 * See Redis Cluster docs for details.
 */
export function hashTag(value: string): string {
  const v = String(value ?? '').trim()
  return v.length ? `{${v}}` : ''
}

/**
 * Normalize a single key segment:
 * - stringify
 * - trim
 * - collapse internal whitespace to single `_`
 * - avoid empty segments
 */
export function normalizeSegment(
  v: string | number | boolean | null | undefined
): string {
  if (v === null || v === undefined) return ''
  const s = String(v).trim()
  if (!s) return ''
  // Replace whitespace runs with underscore, leave colons alone (they’re delimiters by convention).
  return s.replace(/\s+/g, '_')
}

/**
 * Join non-empty segments with the KEY_SEP, avoiding duplicate separators.
 */
export function joinSegments(
  segments: Array<string | null | undefined>
): string {
  const cleaned = segments
    .map((s) => (s == null ? '' : String(s)))
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  return cleaned.join(KEY_SEP).replace(/:{2,}/g, KEY_SEP)
}

/**
 * Build a namespaced key with optional:
 *  - custom prefix (defaults to KEY_PREFIX)
 *  - cluster hash tag (string or boolean to derive from parts)
 *
 * Examples:
 *   buildKey({ ns: 'session', parts: [userId, sessionId], hashTag: userId })
 *   => "helix:session:{<userId>}:<sessionId>"
 */
export function buildKey(
  args: KeyBuild & {
    /** Optional override for redis.constants KEY_PREFIX */
    prefix?: string
    /**
     * If string => use as hash tag "{value}".
     * If true   => derive from first non-empty part.
     * If false/undefined => no hash tag.
     */
    hashTag?: string | boolean
  }
): string {
  const prefix = (args.prefix ?? KEY_PREFIX).trim()
  const ns = normalizeNamespace(args.ns)
  const parts = (args.parts ?? []).map(normalizeSegment).filter(Boolean)

  let tag = ''
  if (typeof args.hashTag === 'string') {
    tag = hashTag(args.hashTag)
  } else if (args.hashTag === true) {
    const first = parts.find(Boolean)
    if (first) tag = hashTag(first)
  }

  const segments = [prefix, ns, tag, ...parts]
  return joinSegments(segments)
}

/**
 * Resolve/validate a KeyNamespace string (allowing KEY_NS values or raw strings).
 */
export function normalizeNamespace(ns: KeyNamespace | string): string {
  if (!ns) return 'custom'
  const v = String(ns)
  // If someone passes KEY_NS.* value, it is already a string like 'session'
  return v.trim()
}

/* ───────────────────────────── Convenience helpers ─────────────────────────── */

/** Session keys: helix:session:{<userId>}:<sessionId> */
export function sessionKey(
  userId: string,
  sessionId: string,
  prefix?: string
): string {
  return buildKey({
    ns: KEY_NS.session,
    parts: [userId, sessionId],
    prefix,
    hashTag: userId,
  })
}

/** Refresh token JTI: helix:refresh:{<userId>}:<jti> */
export function refreshKey(
  userId: string,
  jti: string,
  prefix?: string
): string {
  return buildKey({
    ns: KEY_NS.refresh,
    parts: [userId, jti],
    prefix,
    hashTag: userId,
  })
}

/** JTI reuse detection (seen set / blacklist): helix:jti:{<userId>}:<jti> */
export function jtiKey(userId: string, jti: string, prefix?: string): string {
  return buildKey({
    ns: KEY_NS.jti,
    parts: [userId, jti],
    prefix,
    hashTag: userId,
  })
}

/** OTP codes (email/SMS): helix:otp:{<target>}:<purpose> */
export function otpKey(
  target: string,
  purpose: string,
  prefix?: string
): string {
  return buildKey({
    ns: KEY_NS.otp,
    parts: [target.toLowerCase(), purpose],
    prefix,
    hashTag: target.toLowerCase(),
  })
}

/** Device trust: helix:device:{<userId>}:<deviceId> */
export function deviceTrustKey(
  userId: string,
  deviceId: string,
  prefix?: string
): string {
  return buildKey({
    ns: KEY_NS.device,
    parts: [userId, deviceId],
    prefix,
    hashTag: userId,
  })
}

/** API keys / metadata: helix:apikey:{<orgId_or_userId>}:<publicId> */
export function apiKeyKey(
  ownerId: string,
  publicId: string,
  prefix?: string
): string {
  return buildKey({
    ns: KEY_NS.apiKey,
    parts: [ownerId, publicId],
    prefix,
    hashTag: ownerId,
  })
}

/**
 * Rate-limit window key:
 *  helix:rate:{<bucketId>}:<scope>:<windowEpoch>
 *
 * Example bucketId: deterministicId(userId, routePath) to coalesce by user+route.
 */
export function rateWindowKey(
  bucketId: string,
  scope: string,
  windowEpochSeconds: number,
  prefix?: string
): string {
  return buildKey({
    ns: KEY_NS.rate,
    parts: [bucketId, scope, windowEpochSeconds],
    prefix,
    hashTag: bucketId,
  })
}

/**
 * Build a compact bucket id from arbitrary parts (URL-safe, stable).
 * Useful for rate-limit buckets or cache keys.
 */
export function makeBucketId(
  ...parts: Array<string | number | boolean | null | undefined>
): string {
  return deterministicId(...parts)
}

/**
 * Free-form custom key:
 *   customKey('feature', orgId, 'flag', flagName) =>
 *   "helix:custom:{<orgId>}:feature:<orgId>:flag:<flagName>"
 */
export function customKey(
  hashTagValue: string | undefined,
  prefix: string | undefined,
  ...parts: Array<string | number | boolean | null | undefined>
): string {
  return buildKey({
    ns: KEY_NS.custom,
    parts,
    prefix,
    hashTag: hashTagValue && hashTagValue.length ? hashTagValue : undefined,
  })
}
