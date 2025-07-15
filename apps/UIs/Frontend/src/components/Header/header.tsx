'use client'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { HeaderProps, Page } from './header.types'
import './header.scss'
import MenuIcon from '@mui/icons-material/Menu'
import {
  Box,
  IconButton,
  List,
  ListItem,
  Link as MuiLink,
  Typography,
} from '@mui/material'

export const Header: React.FC<HeaderProps> = ({
  logo,
  title,
  version,
  pages,
  style,
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [canDisplayInline, setCanDisplayInline] = useState(false)

  // Determine if there's room to show links inline
  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth
      const maxInlineWidth = width / 3
      const totalLinksWidth = pages.reduce(
        (sum, p) => sum + p.name.length * 8,
        0
      )
      setCanDisplayInline(totalLinksWidth <= maxInlineWidth)

      // auto-close dropdown if switching back to inline
      if (totalLinksWidth <= maxInlineWidth) {
        setMenuOpen(false)
      }
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [pages])

  const toggleMenu = () => setMenuOpen((v) => !v)

  return (
    <Box component="header" className="header" style={style}>
      {/* Logo / Title / Version */}
      <Box className="header__left">
        <Image src={logo} alt={`${title} logo`} width={120} height={40} />
        <Typography variant="caption" className="header__version">
          V{version}
        </Typography>
      </Box>

      {/* Spacer */}
      <Box className="header__middle" />

      {/* Nav + Hamburger */}
      <nav className="header__nav">
        {/* Hamburger shows on mobile-only */}
        {!canDisplayInline && (
          <IconButton
            className="header__menu-button"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            size="large"
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Links list */}
        <List
          disablePadding
          className={[
            'header__nav-list',
            canDisplayInline
              ? 'header__nav-list--inline'
              : menuOpen
              ? 'header__nav-list--open'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {pages.map((page: Page, i) => (
            <ListItem key={i} disableGutters>
              <MuiLink
                href={page.url}
                underline="none"
                sx={{
                  color: 'inherit',
                  '&:hover': {
                    textDecoration: 'underline',
                    fontWeight: 'bold',
                  },
                }}
              >
                {page.name}
              </MuiLink>
            </ListItem>
          ))}
        </List>
      </nav>
    </Box>
  )
}

export default Header
