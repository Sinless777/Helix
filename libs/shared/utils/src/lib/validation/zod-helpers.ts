import { z } from 'zod';

export const parseOrNull = <T>(schema: z.ZodType<T>, value: unknown): T | null => {
  const res = schema.safeParse(value);
  return res.success ? res.data : null;
};

export const parseOrThrow = <T>(schema: z.ZodType<T>, value: unknown): T =>
  schema.parse(value);

export const isValid = <T>(schema: z.ZodType<T>, value: unknown): value is T =>
  schema.safeParse(value).success;
