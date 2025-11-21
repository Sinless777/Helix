export type AppConfigOption<T> = {
  key: string;
  required?: boolean;
  default?: T;
  parser?: (value: string) => T;
};

export const loadConfig = <T extends Record<string, unknown>>(
  shape: { [K in keyof T]: AppConfigOption<T[K]> },
): T => {
  const result = {} as T;
  for (const [key, spec] of Object.entries(shape) as [
    keyof T,
    AppConfigOption<T[keyof T]>,
  ][]) {
    const raw = spec.required ? process.env[spec.key] : process.env[spec.key];
    if (raw === undefined || raw === null || raw === '') {
      if (spec.required && spec.default === undefined) {
        throw new Error(`Missing required env var: ${spec.key}`);
      }
      (result as Record<string, unknown>)[key as string] = spec.default;
      continue;
    }
    (result as Record<string, unknown>)[key as string] = spec.parser
      ? spec.parser(raw)
      : raw;
  }
  return result;
};

export const parsers = {
  boolean: (fallback = false) => (value: string) => {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0') return false;
    return fallback;
  },
  number: (fallback?: number) => (value: string) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  },
};
