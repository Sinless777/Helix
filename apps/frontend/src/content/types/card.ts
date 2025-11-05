// libs/shared/site-content/src/lib/types/card.ts

import type { HTMLAttributeAnchorTarget } from 'react';

/**
 * A string literal for common aspect ratios plus a flexible `${w}/${h}` fallback.
 * Examples: "16/9", "4/3", "1/1", "21/9", or "3/2".
 */
export type AspectRatio = '16/9' | '4/3' | '1/1' | '21/9' | '3/2' | `${number}/${number}`;

/**
 * Optional visual style overrides. Keep this loose to avoid coupling the core
 * package to a specific styling system (MUI `SxProps`, CSSProperties, etc.).
 */
export type LooseStyleObject = Record<string, unknown>;

/**
 * A single linkable item shown within a technology/feature card.
 */
export interface ListItemProps {
  /** Display name of the technology or resource. */
  text: string;
  /** Canonical documentation or homepage URL. */
  href: string;
  /** Anchor target behavior, e.g., "_blank". */
  target?: HTMLAttributeAnchorTarget;
  /** Concise functional label for quick scanning, e.g., "MLOps Platform". */
  role: string;
  /** Release-quality blurb (≤ 3 sentences). */
  detailedDescription: string;
  /** Optional small emoji or icon identifier for UI. */
  icon?: string;
  /** Optional small image (CDN path or data URL) for row-level visuals. */
  image?: string;
}

/**
 * Props used by “card” sections across the docs/technology pages.
 */
export interface CardProps {
  /** Section title shown at the top of the card. */
  title: string;
  /** One-sentence category overview. */
  description: string;
  /** Optional array of list items rendered inside the card. */
  listItems?: ListItemProps[];
  /** Hero/illustration image for the card (CDN path or URL). */
  image: string;
  /** Internal route (preferred) or absolute URL for the primary CTA. */
  link: string;
  /** Optional button label for the primary CTA. Defaults may be used by the UI. */
  buttonText?: string;
  /** Optional quote or tagline to highlight within the card. */
  quote?: string;
  /** Desired aspect ratio for the hero image or container. */
  aspectRatio?: AspectRatio;
  /**
   * Optional style overrides (kept framework-agnostic).
   * Prefer theme-level styling where possible.
   */
  sx?: LooseStyleObject;
}

/** Readonly variants useful for exported constants. */
export type ReadonlyListItem = Readonly<ListItemProps>;
export type ReadonlyCard = Readonly<
  Omit<CardProps, 'listItems'> & { listItems?: ReadonlyListItem[] }
>;
export type ReadonlyCardArray = ReadonlyArray<ReadonlyCard>;
