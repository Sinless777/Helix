/**
 * ISO 5218 "sex" values (not gender identity).
 * Suggested Cockroach/Postgres enum name: iso5218_enum
 *   0 = unknown, 1 = male, 2 = female, 9 = not applicable
 */
export enum Iso5218Sex {
  unknown = 'unknown',
  male = 'male',
  female = 'female',
  not_applicable = 'not_applicable',
}

/** Map to ISO 5218 numeric codes. */
export const ISO5218_TO_CODE: Record<Iso5218Sex, 0 | 1 | 2 | 9> = {
  [Iso5218Sex.unknown]: 0,
  [Iso5218Sex.male]: 1,
  [Iso5218Sex.female]: 2,
  [Iso5218Sex.not_applicable]: 9,
};

/** Reverse lookup (numeric → enum). */
export const CODE_TO_ISO5218: Record<0 | 1 | 2 | 9, Iso5218Sex> = {
  0: Iso5218Sex.unknown,
  1: Iso5218Sex.male,
  2: Iso5218Sex.female,
  9: Iso5218Sex.not_applicable,
};

export const ISO5218_VALUES: readonly Iso5218Sex[] = [
  Iso5218Sex.unknown,
  Iso5218Sex.male,
  Iso5218Sex.female,
  Iso5218Sex.not_applicable,
] as const;

export function isIso5218Sex(x: unknown): x is Iso5218Sex {
  return typeof x === 'string' && (ISO5218_VALUES as readonly string[]).includes(x);
}
