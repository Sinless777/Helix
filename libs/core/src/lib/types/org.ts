// libs/core/src/lib/types/org.ts

/* -----------------------------------------------------------------------------
 * Organization Types (framework-agnostic)
 * ---------------------------------------------------------------------------*/

/** Generic image reference (URL or path). Keep this as `string` to avoid Next.js coupling. */
export type ImageRef = string

/**
 * Represents an organization, company, or community within the Helix ecosystem.
 * Keep this minimal and portable. App layers can extend via declaration merging.
 */
export interface Org {
  /** Unique ID (machine-friendly key, e.g. "helixai", "sinless-games") */
  id: string

  /** Display name (human-friendly, e.g. "Helix AI") */
  name: string

  /** Optional short tagline/slogan */
  tagline?: string

  /** Optional description of the org */
  description?: string

  /** Public website or landing page */
  url?: string

  /** Logo asset (URL or public path). Next.js apps can import images and pass `.src` here. */
  logo?: ImageRef

  /** Accessible alt text for the logo */
  alt?: string

  /** Optional contact email */
  email?: string

  /** Optional phone number */
  phone?: string

  /** Location metadata */
  location?: {
    city?: string
    state?: string
    country?: string
  }

  /** Social links */
  socials?: {
    twitter?: string
    github?: string
    linkedin?: string
    discord?: string
    youtube?: string
    [key: string]: string | undefined
  }

  /** Optional creation date (ISO 8601 string) */
  founded?: string

  /** Optional size (employees, members, etc.) */
  size?: number

  /** Arbitrary metadata for extensions */
  meta?: Record<string, unknown>
}

/* -----------------------------------------------------------------------------
 * Optional: Team & Member types (safe to keep here if useful)
 * ---------------------------------------------------------------------------*/

export type OrgRole =
  | 'Owner'
  | 'Admin'
  | 'Maintainer'
  | 'Developer'
  | 'Contributor'
  | 'Viewer'

export interface Member {
  id: string
  displayName: string
  email?: string
  avatarUrl?: ImageRef
  roles?: OrgRole[]
  /** Freeform attributes for downstream systems (RBAC IDs, SSO subject, etc.) */
  meta?: Record<string, unknown>
}

export interface Team {
  id: string
  orgId: string // foreign key to Org.id
  name: string
  description?: string
  /** Optional team-level avatar or icon */
  avatarUrl?: ImageRef
  members?: Member[]
  /** Feature flags, quotas, or plan tier can live here if needed */
  meta?: Record<string, unknown>
}
