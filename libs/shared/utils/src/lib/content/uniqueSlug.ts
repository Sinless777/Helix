import { slugify } from './slug';

export const uniqueSlug = (input: string, suffix?: string): string => {
  const base = slugify(input);
  const tag = suffix ?? Math.random().toString(36).slice(2, 8);
  return `${base}-${tag}`;
};
