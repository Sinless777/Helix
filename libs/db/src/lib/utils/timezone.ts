/**
 * IANA timezone helpers for Node/Browser runtimes using the built-in Intl API.
 *
 * - Validation/canonicalization rely on `Intl.DateTimeFormat` and (when available)
 *   `Intl.supportedValuesOf('timeZone')`.
 * - Offset calculation uses `formatToParts` math against the given instant.
 *
 * Notes:
 * - Modern engines accept IANA zone names (e.g., "America/Boise", "UTC"). Some also allow
 *   fixed-offset identifiers (e.g., "+01:00") and "Etc/GMT+8", but this module focuses on IANA zones.
 */

export type UtcOffset = {
  /** Total offset minutes from UTC (east is positive, west is negative). */
  minutes: number;
  /** +HH:MM / -HH:MM rendering. */
  asString: string;
};

const hasSupportedValuesOf =
  typeof (Intl as any).supportedValuesOf === 'function';

/** Returns the canonical timezone name (as reported by Intl) or throws RangeError if invalid. */
export function canonicalizeTimeZone(tz: string): string {
  // Constructing a formatter will throw RangeError if the zone is not recognized.
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz });
  const canonical = formatter.resolvedOptions().timeZone;
  if (!canonical) {
    // Extremely defensive; engines normally return a non-empty canonical name.
    throw new RangeError(`Invalid time zone: ${tz}`);
  }
  return canonical;
}

/** True if `tz` is a valid IANA timezone in this runtime. */
export function isValidIanaTimeZone(tz: string): boolean {
  if (!tz || typeof tz !== 'string') return false;

  // Prefer spec-provided list when available (fast + authoritative for the runtime).
  if (hasSupportedValuesOf) {
    try {
      const list = (Intl as any).supportedValuesOf('timeZone') as string[];
      if (list?.includes(tz)) return true;
      // Try canonical form, in case caller passed an alias.
      try {
        const c = canonicalizeTimeZone(tz);
        return list.includes(c);
      } catch {
        return false;
      }
    } catch {
      // Fall through to the construction check if something odd happens.
    }
  }

  // Fallback: try constructing a formatter (throws RangeError for bad zones).
  try {
    canonicalizeTimeZone(tz);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns all supported timezones for this runtime, if the engine exposes them
 * (Node 18+/20+, modern browsers). Otherwise returns null.
 */
export function getAllIanaTimeZones(): string[] | null {
  if (!hasSupportedValuesOf) return null;
  try {
    return (Intl as any).supportedValuesOf('timeZone') as string[];
  } catch {
    return null;
  }
}

/**
 * Compute the UTC offset for `tz` at a given instant (default: now).
 * Returns minutes east of UTC (e.g., New York in winter = -300) and a "+HH:MM"/"-HH:MM" string.
 */
export function getUtcOffset(tz: string, at: Date = new Date()): UtcOffset {
  const canonical = canonicalizeTimeZone(tz);

  // Format the *same instant* in the target zone to get its local Y-M-D h:m:s,
  // then compare with the actual UTC timestamp.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: canonical,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(at);

  // Pull fields from parts
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);

  const y = get('year');
  const m = get('month'); // 1-12
  const d = get('day');
  const hh = get('hour');
  const mm = get('minute');
  const ss = get('second');

  // Interpreting the local wall time as if it were UTC, then comparing to the real UTC instant
  // gives us the *negative* of the zone offset.
  const asIfUtcMs = Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0);
  const diffMs = asIfUtcMs - at.getTime(); // = -offsetMs
  const offsetMinutes = -Math.round(diffMs / 60000);

  return { minutes: offsetMinutes, asString: offsetMinutesToString(offsetMinutes) };
}

/** Best-effort guess of the user’s local timezone from the runtime. */
export function guessUserTimeZone(): string | undefined {
  try {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

/** Format an offset in minutes as "+HH:MM" / "-HH:MM". */
export function offsetMinutesToString(totalMinutes: number): string {
  const sign = totalMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(totalMinutes);
  const h = Math.floor(abs / 60)
    .toString()
    .padStart(2, '0');
  const m = (abs % 60).toString().padStart(2, '0');
  return `${sign}${h}:${m}`;
}

/**
 * Ensure a timezone is valid in this runtime and return its canonical name.
 * If invalid, returns `fallback` (default: "UTC").
 */
export function coerceTimeZone(tz: string | undefined, fallback = 'UTC'): string {
  try {
    return canonicalizeTimeZone(tz ?? fallback);
  } catch {
    return canonicalizeTimeZone(fallback);
  }
}
