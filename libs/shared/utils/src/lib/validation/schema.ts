import { z } from 'zod';

export const envString = (name: string, fallback?: string) =>
  z
    .string()
    .min(1)
    .transform((v) => v.trim())
    .catch(fallback ?? '');

export const envBool = (fallback = false) =>
  z
    .union([z.literal('true'), z.literal('1'), z.literal('false'), z.literal('0')])
    .transform((v) => v === 'true' || v === '1')
    .catch(fallback);
