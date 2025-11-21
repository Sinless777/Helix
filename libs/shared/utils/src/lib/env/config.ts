export const getEnv = (key: string, fallback?: string): string | undefined =>
  process.env[key] ?? fallback;

export const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

export const getEnvBool = (key: string, fallback = false): boolean => {
  const value = process.env[key];
  if (value === undefined) return fallback;
  const lower = value.toLowerCase();
  if (lower === 'true' || lower === '1') return true;
  if (lower === 'false' || lower === '0') return false;
  return fallback;
};

export const getEnvNumber = (key: string, fallback?: number): number | undefined => {
  const value = process.env[key];
  if (value === undefined) return fallback;
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};
