// libs/core/src/lib/constants/types/citation.ts

/**
 * Represents a single APA-style citation entry.
 */
export interface APACitation {
  /** Author(s), e.g., "Smith, J., & Doe, A." */
  author: string
  /** Year of publication, or "n.d." if no date is available */
  year: string | number
  /** Title of the work */
  title: string
  /** Journal, book, website, or other source */
  source: string
  /** Volume number if applicable */
  volume?: string | number
  /** Issue number if applicable */
  issue?: string | number
  /** Page range, e.g., "12–34" */
  pages?: string
  /** DOI, URL, or other identifier */
  url?: string
  /** Classification category for grouping/filtering */
  category: CitationCategory
}
/**
 * Allowed categories for citation classification.
 *
 * Covers academic, technical, legal, standards, media, and organizational sources.
 */
export type CitationCategory =
  // Scholarly & research
  | 'academic'
  | 'textbook'
  | 'journal article'
  | 'conference paper'
  | 'whitepaper'
  | 'thesis'
  | 'report'

  // Legal & regulatory
  | 'legal'
  | 'standard'
  | 'policy'
  | 'regulation'
  | 'government publication'

  // Software & technical
  | 'Third-Party Application'
  | 'Programming Package'
  | 'AI Model'
  | 'AI Service'
  | 'AI Platform'
  | 'AI Framework'
  | 'AI Library'
  | 'AI Tool'
  | 'AI API'
  | 'AI SDK'
  | 'AI Plugin'
  | 'AI Extension'
  | 'AI Component'
  | 'AI System'
  | 'AI Architecture'
  | 'AI Design Pattern'
  | 'AI Methodology'
  | 'AI Approach'
  | 'AI Technique'

  // Industry & organizational
  | 'standards body'
  | 'company documentation'
  | 'open-source project'
  | 'blog post'
  | 'news article'

  // Media
  | 'book'
  | 'video'
  | 'podcast'
  | 'website'
  | 'dataset'
  | 'other'

/**
 * Container for a page’s citation set.
 */
export interface CitationPageData {
  /** Page title (used as heading in docs) */
  title: string
  /** Optional description/intro text */
  description?: string
  /** List of APA-style citations */
  citations: APACitation[]
}
