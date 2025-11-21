export const normalizeLocale = (value?: string, fallback = 'en'): string => {
  if (!value) return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed.toLowerCase() : fallback;
};
