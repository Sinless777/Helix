import MapIcon from '@mui/icons-material/Map'
import VisibilityIcon from '@mui/icons-material/Visibility'
import type { NavSection } from '../../../types/docs'

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
        href: '/Docs/About-The-Project/Project_Overview'
      },
      {
        id: 'vision',
        label: 'Grand Vision',
        icon: VisibilityIcon,
        href: '/Docs/About-The-Project/Grand_Vision',
        items: [
          {
            id: 'introduction',
            label: 'Introduction',
            href: '/Docs/About-The-Project/Grand_Vision/Introduction'
          },
          {
            id: 'roadmap',
            label: 'Roadmap',
            href: '/Docs/About-The-Project/Grand_Vision/Roadmap'
          },
          {
            id: 'milestones',
            label: 'Milestones',
            href: '/Docs/About-The-Project/Grand_Vision/Milestones'
          }
        ]
      },
      {
        id: 'The Theory',
        label: 'The Theory',
        href: '/Docs/About-The-Project/The_Theory',
        icon: MapIcon,
        badge: 'NEW',
        items: [
          {
            id: 'introduction',
            label: 'Introduction',
            href: '/Docs/About-The-Project/The_Theory/Introduction'
          },
          {
            id: 'Ethical AI and Privacy',
            label: 'Ethical AI and Privacy',
            href: '/Docs/About-The-Project/The_Theory/Ethical_AI_and_Privacy'
          },
          {
            id: 'philosophy',
            label: 'Philosophy',
            href: '/Docs/About-The-Project/The_Theory/Philosophy'
          },
          {
            id: 'architecture',
            label: 'Architecture',
            href: '/Docs/About-The-Project/The_Theory/Architecture'
          },
          {
            id: 'nhp',
            label: 'Helix as a Non-Human Person (NHP)',
            href: '/Docs/About-The-Project/The_Theory/NHP'
          }
        ]
      }
    ]
  },
  {
    id: 'dev-docs',
    title: 'Developer Documentation',
    items: [
      {
        id: 'contributing',
        label: 'Contributing',
        href: '/Docs/Developer-Documentation/Contributing',
        icon: MapIcon
      }
    ]
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
        rel: 'noopener noreferrer'
      },
      {
        id: 'privacy-policy',
        label: 'Privacy Policy',
        href: '/Docs/Legal/Privacy_Policy',
        external: true,
        target: '_blank',
        rel: 'noopener noreferrer'
      },
      {
        id: 'terms-of-service',
        label: 'Terms of Service',
        href: '/Docs/Legal/Terms_of_Service',
        external: true,
        target: '_blank',
        rel: 'noopener noreferrer'
      },
      {
        id: 'credits',
        label: 'Credits',
        href: '/Docs/Legal/Credits',
        external: true,
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    ]
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
        rel: 'noopener noreferrer'
      }
    ]
  }
]
