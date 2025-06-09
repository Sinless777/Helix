type NavItem = {
    label: string
    href: string
}

type Section = {
    title: string
    items: NavItem[]
}

const about: NavItem[] = [
    { label: 'Project Overview', href: '/Docs/About-The-Project/Project_Overview' },
    { label: 'Grand Vision', href: '/Docs/About-The-Project/Grand_Vision' },
    { label: 'Companion Strategy', href: '/Docs/vision/helix_companion_strategy' },
    { label: 'Vision Index', href: '/Docs/vision/index' },
]

const setup: NavItem[] = []

const applicationOverviews: NavItem[] = []

const references: NavItem[] = [
    { label: 'Citations', href: '/Docs/Citations' },
]

export const navSections: Section[] = [
    {
        title: 'About the Project',
        items: about,
    },
    {
        title: 'Setup',
        items: setup
    },
    {
        title: 'Application Overviews',
        items: applicationOverviews
    },
    {
        title: 'References',
        items: references
    },
]