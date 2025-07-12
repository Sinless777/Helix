import { pages } from '../home'

export interface Page {
  name: string
  url: string
}

export interface HeaderProps {
  logo: string // URL or path to the logo image
  title: string
  version: string
  pages: Page[] // Changed from PageList to an array of Page
  style?: React.CSSProperties // Optional custom styling
}


export const headerProps: HeaderProps = {
  logo: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Helix-Logo.webp',
  title: 'Helix AI',
  version: '1.0.0',
  style: {
    padding: '1rem 2rem',
    background:
      'linear-gradient(to right, rgba(246, 6, 111, 0.8), rgba(2, 35, 113, 0.8))',
  },
  pages: pages,
}
