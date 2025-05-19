import { HeaderProps } from '@/components/Header'
import { pages } from '@/constants/home'

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
