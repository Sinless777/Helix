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
  menuOpen: boolean
  toggleMenu: () => void
}
