// libs/core/src/lib/types/developer.ts

import type { Url, UUID, IsoDateTime } from './data'

/* -----------------------------------------------------------------------------
 * Developer Graph & Contribution Types
 * -------------------------------------------------------------------------- */

/**
 * A single contributor (developer, designer, maintainer).
 */
export interface Contributor {
  /** Unique ID for cross-refs (can be UUID or slug). */
  readonly id: UUID | string
  /** Display name (e.g., "Timothy Andrew Pierce"). */
  readonly name: string
  /** Optional short alias/handle (e.g., "tap"). */
  readonly alias?: string
  /** Avatar URL for profile display. */
  readonly avatarUrl?: Url
  /** Primary role or title. */
  readonly role?: string
  /** Optional external links (GitHub, LinkedIn, personal site). */
  readonly links?: ReadonlyArray<{
    readonly label: string
    readonly url: Url
  }>
  /** Biography or contribution notes. */
  readonly bio?: string
  /** Timestamps for lifecycle. */
  readonly joinedAt?: IsoDateTime
  readonly leftAt?: IsoDateTime
}

/**
 * A node in the developer graph (used in diagrams).
 */
export interface DevNode {
  readonly id: string
  /** Short label shown in graph visualizations. */
  readonly label: string
  /** Optional description or tooltip. */
  readonly description?: string
  /** Category for grouping (e.g., "frontend", "backend", "infra"). */
  readonly category?: string
  /** Visual position in layouts. */
  readonly position?: { readonly x: number; readonly y: number }
  /** Icon or image for rendering. */
  readonly iconUrl?: Url
}

/**
 * An edge in the developer graph connecting two nodes.
 */
export interface DevEdge {
  readonly id: string
  /** Source node ID. */
  readonly from: string
  /** Target node ID. */
  readonly to: string
  /** Optional label on the edge (e.g., "depends on"). */
  readonly label?: string
  /** Relationship type. */
  readonly relation?:
    | 'dependsOn'
    | 'contributesTo'
    | 'collaboratesWith'
    | string
  /** Edge style for graph viz. */
  readonly style?: 'solid' | 'dashed' | 'dotted'
}

/**
 * A combined developer graph dataset.
 */
export interface DeveloperGraph {
  readonly nodes: readonly DevNode[]
  readonly edges: readonly DevEdge[]
}

/**
 * High-level page data for developer documentation.
 */
export interface DeveloperPageData {
  readonly title: string
  readonly description?: string
  readonly contributors: readonly Contributor[]
  readonly graph?: DeveloperGraph
}
