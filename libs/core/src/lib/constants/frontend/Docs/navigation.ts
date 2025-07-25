import MapIcon from '@mui/icons-material/Map'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { ElementType } from 'react'

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
  icon?: ElementType // <-------- You just need to import the icon component from MUI or your own library
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
  /** Optional item for nested navigation */
  items?: NavItem[]
}

export interface NavSection {
  /** Unique key for the section */
  id: string
  /** Section heading */
  title: string
  /** Top-level items under this heading */
  items: NavItem[]
}

/**
 * Example usage: you can now nest arbitrarily,
 * add icons, badges, disable links, open externals,
 * and customize per-item behavior.
 */
export const navSections: NavSection[] = [
  {
    id: 'about',
    title: 'About the Project',
    items: [
      {
        id: 'overview',
        label: 'Project Overview',
        href: '/Docs/About-The-Project/Project_Overview',
      },
      {
        id: 'vision',
        label: 'Grand Vision',
        icon: VisibilityIcon,
        href: '/Docs/About-The-Project/Grand_Vision',
        badge: 'Beta',
        items: [
          {
            id: 'introduction',
            label: 'Introduction',
            href: '/Docs/About-The-Project/Grand_Vision/Introduction',
          },
          {
            id: 'roadmap',
            label: 'Roadmap',
            href: '/Docs/About-The-Project/Grand_Vision/Roadmap',
          },
          {
            id: 'milestones',
            label: 'Milestones',
            href: '/Docs/About-The-Project/Grand_Vision/Milestones',
          },
        ],
      },
      {
        id: 'The Theory',
        label: 'The Theory',
        href: '/Docs/About-The-Project/The_Theory',
        icon: MapIcon,
        badge: "NEW",
        items: [
          {
            id: 'introduction',
            label: 'Introduction',
            href: '/Docs/About-The-Project/The_Theory/Introduction',
          },
          {
            id: 'Ethical AI and Privacy',
            label: 'Ethical AI and Privacy',
            href: '/Docs/About-The-Project/The_Theory/Ethical_AI_and_Privacy',
          },
          {
            id: 'philosophy',
            label: 'Philosophy',
            href: '/Docs/About-The-Project/The_Theory/Philosophy',
          },
          {
            id: 'architecture',
            label: 'Architecture',
            href: '/Docs/About-The-Project/The_Theory/Architecture',
          },
        ],
      },
    ],
  },
  {
    id: 'setup',
    title: 'Setup',
    items: [],
  },
  {
    id: 'apps',
    title: 'Application Overviews',
    items: [],
  },
  {
    id: 'dev-docs',
    title: 'Developer Documentation',
    items: [
      {
        id: 'contributing',
        label: 'Contributing',
        href: '/Docs/Developer-Documentation/Contributing',
        icon: MapIcon,
      },
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    items: [
      {
        id: 'license',
        label: 'License',
        href: '/Docs/Legal/License',
        external: true,
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      {
        id: 'privacy-policy',
        label: 'Privacy Policy',
        href: '/Docs/Legal/Privacy_Policy',
        external: true,
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      {
        id: 'terms-of-service',
        label: 'Terms of Service',
        href: '/Docs/Legal/Terms_of_Service',
        external: true,
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    ],
  },
  {
    id: 'refs',
    title: 'References',
    items: [
      {
        id: 'citations',
        label: 'Citations',
        href: '/Docs/Legal/Citations',
        external: true,
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    ],
  },
]
