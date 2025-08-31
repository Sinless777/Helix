// credits.ts
import type { StaticImageData } from 'next/image'

export type Org = {
  name: string
  url?: string
  /** Accepts /public path string or imported image */
  logo?: string | StaticImageData
  /** Optional dark-mode variant */
  logoDark?: string | StaticImageData
  alt?: string
}

export type Person = {
  name: string
  handle?: string // e.g. @user or discord tag
  role?: string // e.g. Moderator, Designer, Reviewer
  url?: string // personal site, GitHub, etc.
}

export type Link = { label: string; url: string }

export type Backer = {
  name: string
  handle?: string
  url?: string
  amount?: number // optional one-time or lifetime
  tier?: 'Patron' | 'Sponsor' | 'Supporter' | 'Angel' | 'Seed' | string
  note?: string
}

export type AccreditationCard = {
  description?: string
  people?: Person[]
  orgs?: Org[] // now supports logos
  links?: Link[]
  tags?: string[]
  // used only by the Crowdfunding card, but harmless on others
  backers?: Backer[]
  platforms?: Org[] // e.g., GitHub Sponsors, OpenCollective (with logos)
}

export const AccreditationCards: Record<string, AccreditationCard> = {
  'Creative Commons': {
    description:
      'Images, icons, and media used under Creative Commons licenses.',
    links: [
      {
        label: 'Creative Commons Licenses',
        url: 'https://creativecommons.org/licenses/'
      }
    ],
    orgs: [
      // { name: 'Unsplash', url: 'https://unsplash.com', logo: '/images/logos/unsplash.svg', alt: 'Unsplash' }
    ],
    people: [
      {
        name: 'Timothy Pierce',
        handle: 'Sinless777',
        role: 'Creator, Owner, Contributor'
      }
    ]
  },

  'Open Source': {
    description:
      'Open-source libraries, frameworks, and maintainers that power Helix.',
    orgs: [
      // { name: 'Next.js', url: 'https://nextjs.org', logo: '/images/logos/nextjs.svg', alt: 'Next.js' },
      // { name: 'Nx', url: 'https://nx.dev', logo: '/images/logos/nx.svg', alt: 'Nx' },
      // { name: 'MUI', url: 'https://mui.com', logo: '/images/logos/mui.svg', alt: 'MUI' },
    ],
    people: [
      {
        name: 'Timothy Pierce',
        handle: 'Sinless777',
        role: 'Creator, Owner, Contributor'
      }
    ],
    tags: ['Libraries', 'Frameworks', 'Packages']
  },

  Editorial: {
    description: 'Writing, copy-editing, proofreading, and style guidance.',
    people: [
      {
        name: 'Dr. Patricia San Antonio',
        handle: 'Setsu',
        role: 'Spell Checker'
      }
    ],
    tags: ['Docs', 'Style', 'Proofreading']
  },

  'Design & Branding': {
    description:
      'Brand system, visual design, iconography, motion, and UX polish.',
    people: [
      {
        name: 'Timothy Pierce',
        handle: 'Sinless777',
        role: 'Creator, Owner, Contributor'
      }
    ],
    tags: ['Brand', 'UI/UX', 'Illustration', 'Motion']
  },

  Engineering: {
    description:
      'Architecture, core features, SDKs/integrations, and performance work.',
    people: [
      {
        name: 'Timothy Pierce',
        handle: 'Sinless777',
        role: 'Creator, Owner, Contributor'
      }
    ],
    tags: ['Backend', 'Frontend', 'Infra']
  },

  Documentation: {
    description: 'Developer docs, tutorials, example apps, and API references.',
    people: [
      {
        name: 'Timothy Pierce',
        handle: 'Sinless777',
        role: 'Creator, Owner, Contributor'
      }
    ],
    tags: ['Guides', 'API', 'Tutorials']
  },

  'Infrastructure & DevOps': {
    description:
      'CI/CD, observability, security hardening, and reliability engineering.',
    people: [
      {
        name: 'Timothy Pierce',
        handle: 'Sinless777',
        role: 'Creator, Owner, Contributor'
      }
    ],
    tags: ['SRE', 'Security', 'Monitoring']
  },

  'Testing & Quality': {
    description:
      'Test strategy, QA, red-teaming, accessibility auditing, and release validation.',
    people: [],
    tags: ['QA', 'Accessibility', 'Red-Team']
  },

  Discord: {
    description:
      'Community moderators, helpers, bug-hunters, and early testers on Discord.',
    links: [
      // { label: 'Join our Discord', url: 'https://discord.gg/your-invite' },
    ],
    people: [
      // { name: 'Jane Doe', handle: 'jane#1234', role: 'Moderator' }
      { name: 'Dr. Patricia San Antonio', handle: 'Setsu', role: 'Creator' },
      {
        name: 'Timothy Pierce',
        handle: 'Sinless777',
        role: 'Creator, Owner, Contributor'
      }
    ],
    tags: ['Community', 'Moderation', 'Feedback']
  },

  'Advisors & Mentors': {
    description:
      'Guidance on strategy, ethics, safety, product, and commercialization.',
    people: [{ name: 'Skip Enger', handle: '', role: 'Advisor' }]
  },

  'Crowdfunding & Backers': {
    description:
      'Backers who financially support Helix and the platforms that make it possible.',
    platforms: [
      // { name: 'GitHub Sponsors', url: 'https://github.com/sponsors/your-org', logo: '/images/logos/github-sponsors.svg', alt: 'GitHub Sponsors' },
      // { name: 'OpenCollective', url: 'https://opencollective.com/your-org', logo: '/images/logos/opencollective.svg', alt: 'OpenCollective' },
      // { name: 'Patreon', url: 'https://patreon.com/your-org', logo: '/images/logos/patreon.svg', alt: 'Patreon' },
      // { name: 'Kickstarter', url: 'https://kickstarter.com/your-project', logo: '/images/logos/kickstarter.svg', alt: 'Kickstarter' },
    ],
    backers: [
      // { name: 'Alice', tier: 'Sponsor', amount: 100, handle: '@alice' },
      // { name: 'Bob', tier: 'Supporter', amount: 25 },
    ],
    links: [
      // { label: 'Support Helix on OpenCollective', url: 'https://opencollective.com/your-org' },
    ],
    tags: ['Funding', 'Backers']
  },

  'Special Thanks': {
    description:
      'Generous support, inspiration, and encouragement that shaped Helix.',
    people: [
      { name: 'Misty Enger', handle: '', role: 'Supporter' },
      { name: 'Skip Enger', handle: '', role: 'Supporter' },
      { name: 'Ted Pierce', handle: 'Sinner', role: 'Supporter' },
      { name: 'Tyler Clark', handle: 'Voice of Ruin', role: 'Supporter' },
      { name: 'Jereme Bancel', handle: 'bancel_', role: 'Supporter' },
      { name: 'PD Smith', handle: 'Dr. Robotnik', role: 'Supporter' }
    ]
  }
}
