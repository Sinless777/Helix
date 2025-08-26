// libs/email/src/lib/utils/address.util.ts
// -----------------------------------------------------------------------------
// Address helpers for the email library.
// These utilities keep parsing/normalizing of email addresses in one place so
// transports and higher-level services don’t have to re-implement the basics.
// -----------------------------------------------------------------------------
//
// What you get:
//   • parseAddress()            — "Jane <jane@x.com>" → { name, address }
//   • parseAddressList()        — split + parse a comma/angle/quoted list
//   • normalizeAddress()        — Address → NormalizedAddress
//   • normalizeAddressField()   — AddressField → NormalizedAddress[]
//   • formatAddress()           — { name, address } → "Name <addr>"
//   • dedupeAddresses()         — case-insensitive address dedupe
//   • isValidEmail()            — simple RFC5322-ish validator (pragmatic)
//
// Notes:
//   • We intentionally keep validation permissive. Providers (SMTP/API) will
//     ultimately validate more strictly. Use isValidEmail() for early checks.
//   • All functions are pure / sync and have no runtime deps.
//

import type {
  Address,
  AddressField,
  NormalizedAddress
} from '../types/email.types'

/* -----------------------------------------------------------------------------
 * Internals
 * -------------------------------------------------------------------------- */

/** Trim helper that also collapses internal whitespace for names. */
function cleanName(name: string | null | undefined): string | null {
  if (!name) return null
  const s = String(name).replace(/\s+/g, ' ').trim()
  return s.length ? s : null
}

/**
 * Very small state machine that splits a list of addresses by commas,
 * while respecting quoted strings and angle brackets.
 *
 * Examples:
 *  - 'a@example.com, "Jane, D." <jane@example.com>' -> two entries
 *  - 'Team <team@example.com>, dev@example.com'     -> two entries
 */
function splitAddresses(list: string): string[] {
  const out: string[] = []
  let buf = ''
  let inQuotes = false
  let angleDepth = 0

  for (let i = 0; i < list.length; i++) {
    const ch = list[i]

    if (ch === '"') {
      // toggle quotes, but ignore escaped quotes (\")
      const prev = list[i - 1]
      if (prev !== '\\') inQuotes = !inQuotes
      buf += ch
      continue
    }

    if (!inQuotes) {
      if (ch === '<') angleDepth++
      if (ch === '>' && angleDepth > 0) angleDepth--
      if (ch === ',' && angleDepth === 0) {
        if (buf.trim()) out.push(buf.trim())
        buf = ''
        continue
      }
    }

    buf += ch
  }

  if (buf.trim()) out.push(buf.trim())
  return out
}

/**
 * Quick-and-pragmatic email validation.
 * This is NOT a full RFC 5322 validator (that regex is huge and not useful in
 * practice). We keep it strict enough to catch obvious mistakes.
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false
  const s = email.trim()
  // Disallow control chars and spaces
  if (/[^\S ]|\s/.test(s)) return false
  // Simplified structure: local@domain.tld (local and domain may contain
  // common symbols, domain must have at least one dot and 2+ TLD chars)
  const re = /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i
  return re.test(s)
}

/* -----------------------------------------------------------------------------
 * Public API
 * -------------------------------------------------------------------------- */

/**
 * Parse a single address string into a normalized object.
 * Accepts:
 *   - "Jane <jane@example.com>"
 *   - 'jane@example.com'
 *   - '"Jane, D." <jane@example.com>'
 */
export function parseAddress(input: string): NormalizedAddress {
  const s = String(input).trim()

  // Angle-bracket form: optional display name + < address >
  // Capture groups:
  //   1: display name (may be quoted)
  //   2: email address inside angle brackets
  const angleMatch = s.match(/^\s*(?:"?([^"]*)"?\s*)?<\s*([^>]+)\s*>\s*$/)
  if (angleMatch) {
    const nameRaw = angleMatch[1] ?? null
    const address = angleMatch[2].trim()
    return {
      name: cleanName(nameRaw),
      address
    }
  }

  // No angle brackets; treat the whole thing as an address
  return { name: null, address: s }
}

/**
 * Normalize an Address (string or object) into a canonical object form.
 */
export function normalizeAddress(addr: Address): NormalizedAddress {
  if (typeof addr === 'string') return parseAddress(addr)
  return {
    name: cleanName(addr.name ?? null),
    address: String(addr.address).trim()
  }
}

/**
 * Normalize an AddressField (single or array) into a list of canonical objects.
 * Also supports a single string containing multiple addresses separated by
 * commas (respecting quoted strings/angle brackets).
 */
export function normalizeAddressField(
  field: AddressField
): NormalizedAddress[] {
  if (Array.isArray(field)) {
    return field
      .flatMap((a) =>
        typeof a === 'string'
          ? splitAddresses(a).map(parseAddress)
          : [normalizeAddress(a)]
      )
      .filter((a) => !!a.address)
  }

  if (typeof field === 'string') {
    return splitAddresses(field).map(parseAddress)
  }

  return [normalizeAddress(field)]
}

/**
 * Format a normalized address as a display string: "Name <addr>" or "addr".
 * Escapes embedded quotes in the name.
 */
export function formatAddress(a: NormalizedAddress): string {
  const name = cleanName(a.name)
  if (name && name.length) {
    const safe = name.replace(/"/g, '\\"')
    return `"${safe}" <${a.address}>`
  }
  return a.address
}

/**
 * Parse a comma/angle/quoted list into normalized addresses.
 * Equivalent to `normalizeAddressField(string)`.
 */
export function parseAddressList(list: string): NormalizedAddress[] {
  return splitAddresses(list).map(parseAddress)
}

/**
 * Deduplicate addresses by email (case-insensitive) while preserving the first
 * occurrence’s display name.
 */
export function dedupeAddresses(addresses: AddressField): NormalizedAddress[] {
  const list = normalizeAddressField(addresses)
  const seen = new Set<string>()
  const out: NormalizedAddress[] = []

  for (const a of list) {
    const key = a.address.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(a)
  }

  return out
}
