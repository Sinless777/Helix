// libs/core/src/lib/constants/frontend/header/index.ts

import type { CSSProperties } from 'react'
import { pages, type Page } from '../home'

/** A single navigation link in the header */
export interface HeaderLink {
  /** Display name shown in the nav */
  name: string
  /** Path or URL */
  url: string
}

/** Config object for rendering the Helix header */
export interface HeaderProps {
  /** URL or path to the logo image */
  logo: string
  /** Displayed title text */
  title: string
  /** Current app version (semantic version string) */
  version: string
  /** List of navigation pages */
  pages: readonly Page[]
  /** Optional custom styling overrides */
  style?: CSSProperties
}

/** Default header configuration for Helix */
export const headerProps: HeaderProps = {
  logo: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Helix-Logo.webp',
  title: 'Helix AI',
  version: '1.0.0',
  pages,
  style: {
    padding: '1rem 2rem',
    background:
      'linear-gradient(to right, rgba(246, 6, 111, 0.8), rgba(2, 35, 113, 0.8))'
  }
} as const
