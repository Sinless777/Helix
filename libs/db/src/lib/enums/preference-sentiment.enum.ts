/**
 * Sentiment enum for user preferences / affinities.
 * Intended to map to a Cockroach/Postgres enum named `preference_enum`.
 */

export enum PreferenceSentiment {
  like = 'like',
  dislike = 'dislike',
  neutral = 'neutral',
}

/** All valid enum values (stable order). */
export const PREFERENCE_SENTIMENT_VALUES: readonly PreferenceSentiment[] = [
  PreferenceSentiment.like,
  PreferenceSentiment.dislike,
  PreferenceSentiment.neutral,
] as const;

/** Type guard for unknown input. */
export function isPreferenceSentiment(x: unknown): x is PreferenceSentiment {
  return (
    typeof x === 'string' &&
    (PREFERENCE_SENTIMENT_VALUES as readonly string[]).includes(x)
  );
}

/** Map a sentiment to a numeric score useful for ranking/weights. */
export const PREFERENCE_SENTIMENT_SCORE: Record<PreferenceSentiment, number> = {
  [PreferenceSentiment.like]: 1,
  [PreferenceSentiment.dislike]: -1,
  [PreferenceSentiment.neutral]: 0,
};

/** Human-readable label (customize for i18n as needed). */
export function displayPreferenceSentiment(s: PreferenceSentiment): string {
  switch (s) {
    case PreferenceSentiment.like:
      return 'Like';
    case PreferenceSentiment.dislike:
      return 'Dislike';
    case PreferenceSentiment.neutral:
      return 'Neutral';
    default:
      return String(s);
  }
}
