/**
 * BCP-47 utilities for validating, canonicalizing, and lightly parsing IETF language tags.
 *
 * - Validation + canonicalization is delegated to `Intl.getCanonicalLocales()`, which
 *   verifies *structural* validity of tags and returns canonical casing + preferred forms
 *   (e.g., "iw" → "he", "in" → "id", "ji" → "yi") per UTS #35/BCP-47.
 * - Parsing here is intentionally “lightweight”: it assumes input has already been
 *   canonicalized and extracts common subtags (language/script/region/variants/extensions/privateUse).
 *
 * References:
 *   - RFC 5646 / BCP-47 (structure of tags)
 *   - W3C guidance on casing conventions (language lower, Script TitleCase, REGION UPPER)
 *   - MDN: Intl.getCanonicalLocales (validation + canonicalization)
 */

export type Bcp47Parsed = {
  /** Primary language subtag (lowercase), or undefined if tag is private-use only (e.g., "x-foo"). */
  language?: string;
  /** Optional script subtag (TitleCase). */
  script?: string;
  /** Optional region subtag (UPPERCASE alpha-2 or 3-digit UN M.49 code). */
  region?: string;
  /** Optional variant subtags (each 5–8 alnum, or 4 digits). */
  variants: string[];
  /**
   * Extensions, grouped by singleton (excluding 'x').
   * Example: "en-u-ca-buddhist" → [{ singleton: 'u', parts: ['ca','buddhist'] }]
   */
  extensions: Array<{ singleton: string; parts: string[] }>;
  /** Private-use subtags after 'x-'. Example: "x-foo-bar" → ['foo','bar'] */
  privateUse: string[];
  /** The canonical, structurally-valid tag (or 'und' for undefined language if you choose to map). */
  canonical: string;
};

/** True if the input is a structurally valid BCP-47 tag. */
export function isStructurallyValidBcp47(tag: string): boolean {
  if (!tag || typeof tag !== 'string') return false;
  try {
    // MDN: throws RangeError if any tag is not structurally valid.
    // Also canonicalizes casing and some deprecated subtags.
    void Intl.getCanonicalLocales(tag);
    return true;
  } catch {
    return false;
  }
}

/** Canonicalizes a tag (case, deprecated subtags, etc.). Throws RangeError if invalid. */
export function canonicalizeBcp47(tag: string): string {
  const [canonical] = Intl.getCanonicalLocales(tag);
  // Some environments return an empty array only if input is empty; guard anyway.
  if (!canonical) throw new RangeError(`Invalid BCP-47 tag: ${tag}`);
  return canonical;
}

/** Canonicalizes many tags, validates them, de-duplicates, and preserves order of first occurrence. */
export function canonicalizeManyBcp47(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags ?? []) {
    const c = canonicalizeBcp47(t);
    if (!seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  return out;
}

/**
 * Parses a (preferably canonicalized) BCP-47 tag into parts.
 * This is not a full RFC grammar parser; it aims to be pragmatic for app logic and prompts.
 *
 * If you pass a non-canonical tag, it will be canonicalized first.
 */
export function parseBcp47(tag: string): Bcp47Parsed {
  const canonical = canonicalizeBcp47(tag);
  const parts = canonical.split('-');

  // Private-use-only tags: "x-..."
  if (parts[0] === 'x') {
    return {
      language: undefined,
      script: undefined,
      region: undefined,
      variants: [],
      extensions: [],
      privateUse: parts.slice(1),
      canonical,
    };
  }

  let i = 0;

  // Primary language (required unless private-use-only)
  const language = parts[i++]?.toLowerCase();

  // Optional script: 4 letters, TitleCase by convention in canonical form
  let script: string | undefined;
  if (parts[i] && /^[A-Za-z]{4}$/.test(parts[i])) {
    script = parts[i][0].toUpperCase() + parts[i].slice(1).toLowerCase();
    i++;
  }

  // Optional region: 2 alpha (A-Z) or 3 digits
  let region: string | undefined;
  if (parts[i] && (/^[A-Z]{2}$/.test(parts[i]) || /^[0-9]{3}$/.test(parts[i]))) {
    region = parts[i];
    i++;
  }

  // Variants: 5–8 alnum OR 4 digits
  const variants: string[] = [];
  while (parts[i] && (/^[A-Za-z0-9]{5,8}$/.test(parts[i]) || /^[0-9]{4}$/.test(parts[i]))) {
    variants.push(parts[i]);
    i++;
  }

  // Extensions: one or more groups, each starting with a singleton [0-9A-WY-Za-wy-z] (not 'x')
  const extensions: Array<{ singleton: string; parts: string[] }> = [];
  while (parts[i] && /^[0-9A-WY-Za-wy-z]$/.test(parts[i])) {
    const singleton = parts[i].toLowerCase();
    i++;
    const extParts: string[] = [];
    // At least one following subtag of length 2–8 until next singleton or 'x' or end
    while (parts[i] && /^[A-Za-z0-9]{2,8}$/.test(parts[i])) {
      extParts.push(parts[i].toLowerCase());
      // lookahead: break if next piece is a singleton or private-use
      if (parts[i + 1] && (/^[0-9A-WYZa-wy-z]$/.test(parts[i + 1]) || parts[i + 1] === 'x')) {
        i++;
        break;
      }
      i++;
    }
    extensions.push({ singleton, parts: extParts });
  }

  // Private-use: 'x' followed by 1–8 alnum chunks
  const privateUse: string[] = [];
  if (parts[i] === 'x') {
    i++;
    while (parts[i] && /^[A-Za-z0-9]{1,8}$/.test(parts[i])) {
      privateUse.push(parts[i].toLowerCase());
      i++;
    }
  }

  return { language, script, region, variants, extensions, privateUse, canonical };
}

/**
 * Returns true if this locale is *supported by the current runtime* for Intl APIs
 * (beyond structural validity). Handy for picking UI locales/fallbacks.
 */
export function isRuntimeSupportedLocale(tag: string): boolean {
  try {
    const canonical = canonicalizeBcp47(tag);
    return Intl.DateTimeFormat.supportedLocalesOf([canonical]).length > 0;
  } catch {
    return false;
  }
}

/** Picks the first runtime-supported locale from `candidates`; falls back to `fallback` (default 'en'). */
export function pickSupportedLocale(
  candidates: string[],
  fallback = 'en'
): string {
  for (const c of candidates) {
    if (isRuntimeSupportedLocale(c)) return canonicalizeBcp47(c);
  }
  // Ensure fallback is canonical & valid (will throw if misconfigured)
  try {
    return canonicalizeBcp47(fallback);
  } catch {
    return 'en';
  }
}

/** Simple guard that throws a helpful error if the tag is not structurally valid. */
export function assertBcp47(tag: string, msg?: string): void {
  if (!isStructurallyValidBcp47(tag)) {
    throw new RangeError(msg ?? `Invalid BCP-47 language tag: ${tag}`);
  }
}
