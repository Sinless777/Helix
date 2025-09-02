// libs/core/src/lib/types/docs.ts

import type { ElementType } from 'react'

/* -------------------------------------------------------------------------- */
/* Pillars & Innovation Criteria                                              */
/* -------------------------------------------------------------------------- */

export interface Pillar {
  /** Machine-friendly key (slug, lowercase, kebab-case). */
  readonly id: string
  /** Short label (used in UI headings). */
  readonly title: string
  /** Detailed explanation. */
  readonly description: string
  /** Optional emoji or icon key. */
  readonly icon?: string
  /** Optional grouping (e.g., Ethics, Security). */
  readonly category?: string
}

export interface InnovationCriterion {
  /** Machine-friendly identifier (slug, lowercase, kebab-case). */
  readonly id: string
  /** Short label (e.g., "User Impact"). */
  readonly title: string
  /** Detailed explanation of the criterion. */
  readonly description: string
  /** Optional grouping (e.g., UX, Security, Operations). */
  readonly category?: string
  /** Optional emoji or icon key. */
  readonly icon?: string
}

/* -------------------------------------------------------------------------- */
/* Roadmap                                                                    */
/* -------------------------------------------------------------------------- */

export type RoadmapStatus = 'not-started' | 'in-progress' | 'completed'

/** Prefer ISO 8601 ("YYYY-MM-DD"). Allow freeform strings for TBD, month names, etc. */
export type IsoDateString = `${number}-${number}-${number}` | string

export interface Task {
  /** Composite ID unique across roadmap. Convention: `p{phase}-{taskNumber}` (e.g., "p1-000"). */
  readonly id: string
  readonly title: string
  readonly description: string
  readonly status: RoadmapStatus
  readonly assigned_to?: string
  readonly completion_date?: IsoDateString
}

export interface Phase {
  /** Machine-readable phase key. */
  readonly phase: number | string
  readonly title: string
  readonly description: string
  /** Freeform timeframe (e.g., "October 2025", "TBD"). */
  readonly time_frame: string
  readonly status: RoadmapStatus
  readonly tasks: Task[]
  readonly completion_date?: IsoDateString
}

/* -------------------------------------------------------------------------- */
/* Developer Graph (Docs Visuals)                                             */
/* -------------------------------------------------------------------------- */

export interface FlowNodeData {
  readonly id: string
  readonly label: string
  readonly position: { readonly x: number; readonly y: number }
  readonly width?: number
  readonly style?: {
    readonly background?: string
    readonly color?: string
    readonly border?: string
    readonly borderRadius?: number
    readonly padding?: number
    readonly textAlign?: 'left' | 'center' | 'right'
  }
}

export interface FlowEdgeData {
  readonly id: string
  readonly source: string
  readonly target: string
  readonly type?: 'smoothstep' | 'bezier' | 'straight' | 'step'
  readonly style?: {
    readonly stroke?: string
    readonly strokeWidth?: number
    readonly strokeDasharray?: string
  }
}
