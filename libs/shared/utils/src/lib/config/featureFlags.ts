export type FeatureFlags = Record<string, boolean>;

export const isFeatureEnabled = (
  flags: FeatureFlags,
  flag: string,
  fallback = false,
): boolean => flags[flag] ?? fallback;

export const parseFeatureFlags = (value?: string): FeatureFlags => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [k, v === true || v === 'true']),
    );
  } catch {
    return {};
  }
};
