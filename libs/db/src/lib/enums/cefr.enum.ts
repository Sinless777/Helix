/**
 * CEFR proficiency levels (+ a 'native' sentinel for mother-tongue fluency).
 * Intended to map to a Cockroach/Postgres enum named `cefr_enum`.
 *
 * Order (weak → strong):
 *   A1 < A2 < B1 < B2 < C1 < C2 < native
 */

export enum Cefr {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
  native = 'native',
}

/** All CEFR values in ascending order of proficiency. */
export const CEFR_VALUES: readonly Cefr[] = [
  Cefr.A1,
  Cefr.A2,
  Cefr.B1,
  Cefr.B2,
  Cefr.C1,
  Cefr.C2,
  Cefr.native,
] as const;

/** Numeric ordering for easy compares/sorts. */
export const CEFR_ORDER: Record<Cefr, number> = {
  [Cefr.A1]: 0,
  [Cefr.A2]: 1,
  [Cefr.B1]: 2,
  [Cefr.B2]: 3,
  [Cefr.C1]: 4,
  [Cefr.C2]: 5,
  [Cefr.native]: 6,
};

/** Type guard for unknown input. */
export function isCefr(x: unknown): x is Cefr {
  return typeof x === 'string' && (CEFR_VALUES as readonly string[]).includes(x);
}

/** Compare two CEFR levels (returns -1, 0, 1). */
export function compareCefr(a: Cefr, b: Cefr): number {
  const da = CEFR_ORDER[a];
  const db = CEFR_ORDER[b];
  return da === db ? 0 : da < db ? -1 : 1;
}

/** Max of provided levels (by proficiency). Undefined if none provided. */
export function maxCefr(...levels: Array<Cefr | undefined | null>): Cefr | undefined {
  let best: Cefr | undefined;
  for (const lvl of levels) {
    if (!lvl) continue;
    if (!best || CEFR_ORDER[lvl] > CEFR_ORDER[best]) best = lvl;
  }
  return best;
}

/** Friendly label for display (customize as needed). */
export function displayCefr(level: Cefr): string {
  switch (level) {
    case Cefr.A1: return 'A1 · Beginner';
    case Cefr.A2: return 'A2 · Elementary';
    case Cefr.B1: return 'B1 · Intermediate';
    case Cefr.B2: return 'B2 · Upper-Intermediate';
    case Cefr.C1: return 'C1 · Advanced';
    case Cefr.C2: return 'C2 · Mastery';
    case Cefr.native: return 'Native';
    default: return String(level);
  }
}
