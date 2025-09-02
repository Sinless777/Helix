// libs/core/src/lib/types/navigation.ts
import { type ElementType } from 'react'

/* -----------------------------------------------------------------------------
 * Navigation Types
 * ---------------------------------------------------------------------------*/

/**
 * Individual navigation item.
 */
export interface NavItem {
  /** Unique key (used for rendering/list operations) */
  id: string
  /** Display text */
  label: string
  /** URL to navigate to (omit if this is a pure parent group) */
  href?: string
  /** Nested items for multi-level menus */
  children?: NavItem[]
  /** Any React component (MUI icon, custom SVG, etc.) */
  icon?: ElementType
  /** Opens link in new tab if true */
  external?: boolean
  /** HTML target attribute (overrides `external`) */
  target?: '_blank' | '_self' | '_parent' | '_top'
  /** HTML rel attribute (e.g. "noopener noreferrer") */
  rel?: 'noopener' | 'noreferrer' | 'nofollow' | 'external' | string
  /** Renders item in a disabled style/ignores clicks */
  disabled?: boolean
  /** Small badge (e.g. "New", "Beta", count, etc.) */
  badge?: string | number | 'alpha' | 'beta' | 'stable' | ''
  /** Optional item for nested navigation (alias of children) */
  items?: NavItem[]
}

/**
 * Group of navigation items under a shared heading.
 */
export interface NavSection {
  /** Unique key for the section */
  id: string
  /** Section heading */
  title: string
  /** Top-level items under this heading */
  items: NavItem[]
}

/**
 * Entire navigation structure, composed of sections.
 */
export interface NavigationSchema {
  sections: NavSection[]
}
