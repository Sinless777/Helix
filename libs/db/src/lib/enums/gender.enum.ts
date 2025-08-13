/**
 * Gender identity enum (inclusive list for app UX/personalization).
 * You asked to include LGBTQ identities and also "male", "female", and "trans".
 *
 * Recommended approach:
 * - Store one of the CANONICAL values below.
 * - Accept aliases like "male"/"female" and normalize them to "man"/"woman".
 * - Keep a free-text `genderSelfDescription` alongside this enum if the user prefers their own label.
 *
 * Suggested Cockroach/Postgres enum name: gender_enum
 */
export enum Gender {
  // Canonical identities
  man = 'man',
  woman = 'woman',
  non_binary = 'non_binary',
  agender = 'agender',
  genderqueer = 'genderqueer',
  genderfluid = 'genderfluid',
  bigender = 'bigender',
  trans = 'trans',             // umbrella (when user prefers this general label)
  trans_man = 'trans_man',
  trans_woman = 'trans_woman',
  two_spirit = 'two_spirit',
  questioning = 'questioning',
  prefer_not_to_say = 'prefer_not_to_say',
  self_described = 'self_described',

  // Aliases/synonyms you asked to include explicitly
  male = 'male',               // alias → canonical: man
  female = 'female',           // alias → canonical: woman
}

/** Canonical values we encourage storing in DB (aliases excluded). */
export const GENDER_CANONICAL_VALUES: readonly Gender[] = [
  Gender.man,
  Gender.woman,
  Gender.non_binary,
  Gender.agender,
  Gender.genderqueer,
  Gender.genderfluid,
  Gender.bigender,
  Gender.trans,
  Gender.trans_man,
  Gender.trans_woman,
  Gender.two_spirit,
  Gender.questioning,
  Gender.prefer_not_to_say,
  Gender.self_described,
] as const;

/** All enum members, including aliases. */
export const GENDER_VALUES: readonly Gender[] = [
  ...GENDER_CANONICAL_VALUES,
  Gender.male,
  Gender.female,
] as const;

/** Alias → canonical normalization map. */
const GENDER_ALIASES: Record<string, Gender> = {
  male: Gender.man,
  female: Gender.woman,
  // common free-text inputs mapped to enum
  m: Gender.man,
  f: Gender.woman,
  nb: Gender.non_binary,
  nonbinary: Gender.non_binary,
  'non-binary': Gender.non_binary,
  enby: Gender.non_binary,
  transmale: Gender.trans_man,
  trans_man: Gender.trans_man,
  transman: Gender.trans_man,
  transfemale: Gender.trans_woman,
  trans_female: Gender.trans_woman,
  transwoman: Gender.trans_woman,
};

/** Type guard. */
export function isGender(x: unknown): x is Gender {
  return typeof x === 'string' && (GENDER_VALUES as readonly string[]).includes(x);
}

/** Normalize free-text or alias to a canonical Gender value. */
export function canonicalizeGender(input: string): Gender | undefined {
  if (!input) return undefined;
  const key = String(input).trim().toLowerCase().replace(/\s+/g, '_');
  // exact enum match?
  const direct = (GENDER_VALUES as readonly string[]).find((v) => v === key) as Gender | undefined;
  if (direct) {
    // If it's an alias, convert to canonical
    return (GENDER_ALIASES[key] as Gender | undefined) ?? (direct as Gender);
  }
  // alias?
  const alias = GENDER_ALIASES[key];
  if (alias) return alias;
  // unknown → let caller handle (e.g., store self_described + keep the raw string elsewhere)
  return undefined;
}

/** Human-friendly labels (UI). */
export function displayGender(g: Gender): string {
  switch (g) {
    case Gender.man: return 'Man';
    case Gender.woman: return 'Woman';
    case Gender.non_binary: return 'Non-binary';
    case Gender.agender: return 'Agender';
    case Gender.genderqueer: return 'Genderqueer';
    case Gender.genderfluid: return 'Genderfluid';
    case Gender.bigender: return 'Bigender';
    case Gender.trans: return 'Trans';
    case Gender.trans_man: return 'Trans man';
    case Gender.trans_woman: return 'Trans woman';
    case Gender.two_spirit: return 'Two-Spirit';
    case Gender.questioning: return 'Questioning';
    case Gender.prefer_not_to_say: return 'Prefer not to say';
    case Gender.self_described: return 'Self-described';
    case Gender.male: return 'Male (alias: Man)';
    case Gender.female: return 'Female (alias: Woman)';
    default: return String(g);
  }
}
