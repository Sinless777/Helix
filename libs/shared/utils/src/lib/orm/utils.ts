export const buildPagination = (limit = 25, offset = 0) => ({
  limit: Math.max(0, limit),
  offset: Math.max(0, offset),
});

export const toBoolean = (value: unknown): boolean =>
  value === true || value === 'true' || value === '1';
