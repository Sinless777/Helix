const unitInMs: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export const parseDuration = (value: string, fallbackMs = 0): number => {
  const match = /^(\d+(?:\.\d+)?)(ms|s|m|h|d)$/.exec(value.trim());
  if (!match) return fallbackMs;
  const [, amount, unit] = match;
  const factor = unitInMs[unit];
  return factor ? Number(amount) * factor : fallbackMs;
};

export const formatDuration = (ms: number): string => `${ms}ms`;
