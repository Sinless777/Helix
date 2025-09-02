// libs/core/src/lib/types/technology.ts

/* -----------------------------------------------------------------------------
 * Technology Types
 * Standardized props for technology cards, list items, and catalog sections
 * used throughout Helix AI docs and UI.
 * ---------------------------------------------------------------------------*/

/**
 * Individual item shown within a card’s list.
 */
export interface ListItemProps {
  /** Display name of the technology */
  text: string
  /** Canonical documentation or homepage URL */
  href: string
  /** Optional target for link (e.g. _blank for new tab) */
  target?: React.HTMLAttributeAnchorTarget
  /** Concise functional label (e.g. "CI/CD Automation") */
  role: string
  /** Release-quality description (≤ 3 sentences) */
  detailedDescription: string
  /** Optional icon key (Lucide, MUI, or custom) */
  icon?: string
  /** Optional image URL (CDN or relative path) */
  image?: string
}

/**
 * A full card component that groups a category of technologies.
 */
export interface CardProps {
  /** Heading displayed on the card */
  title: string
  /** One-sentence description of the category */
  description: string
  /** Optional list of individual technologies */
  listItems?: ListItemProps[]
  /** CDN URL or local asset for card image */
  image: string
  /** Internal link for the "Learn more" page */
  link: string
  /** Label for the call-to-action button */
  buttonText?: string
  /** Optional quote or highlight blurb */
  quote?: string
  /** Aspect ratio for rendering images/videos */
  aspectRatio?: string
  /** Extra system-specific style overrides */
  sx?: object
}

/**
 * Aggregated collection of cards for a technology section.
 */
export interface TechnologySection {
  /** Section identifier (e.g. "ai-tools", "cloud-platforms") */
  id: string
  /** Display title */
  title: string
  /** Cards inside this section */
  cards: CardProps[]
}
