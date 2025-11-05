// libs/shared/site-content/src/lib/home/index.ts

/** Represents a single navigation page */
export interface Page {
  /** Display name shown in the nav */
  name: string;
  /** Path or URL */
  url: string;
}

/** Main navigation pages for Helix */
export const pages: Readonly<Page[]> = [
  { name: 'Home', url: '/' },
  { name: 'About', url: '/About' },
  { name: 'Contact', url: '/Contact' },
  { name: 'Tech Stack', url: '/technology' },
  { name: 'Docs', url: '/Docs' },
] as const;
