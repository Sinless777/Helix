"use client"

import React, { useState, useEffect } from 'react'
import { HeaderProps, Page } from './header.types'
import Image from 'next/image'
import './header.scss'

import { Box, Typography, IconButton, List, ListItem, Link as MuiLink } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

export const Header: React.FC<HeaderProps> = ({
  logo,
  title,
  version,
  pages,
  style,
}) => {
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }
  const [canDisplay, setCanDisplay] = useState(false)

  useEffect(() => {
    const checkDisplayPages = () => {
      const headerWidth = window.innerWidth
      const maxPagesWidth = headerWidth / 3
      const totalPagesWidth = pages.reduce(
        (total, page) => total + page.name.length * 8,
        0
      )
      setCanDisplay(totalPagesWidth <= maxPagesWidth)
    }

    checkDisplayPages()
    window.addEventListener('resize', checkDisplayPages)
    return () => window.removeEventListener('resize', checkDisplayPages)
  }, [pages])

  return (
    <Box component="header" className="header">
      {/* Left Section: Logo, Title, Version */}
      <Box id="Title-Logo-Version" className="header__left">
        <Image
          src={logo}
          alt={`${title} logo`}
          height={100}
          width={300}
        />
        <Typography variant="caption" className="header__version">
          V{version}
        </Typography>
      </Box>

      {/* Middle Section: Empty to maintain 1/3rd spacing */}
      <Box className="header__middle" />

      {/* Right Section: Navigation or Hamburger Menu */}
      <nav className="header__nav">
        <List
          className={`header__nav-list ${
            menuOpen ? 'header__nav-list--open' : ''
          } ${canDisplay ? '' : 'hidden'}`}
          disablePadding
        >
          {canDisplay &&
            pages.map((page: Page, index) => (
              <ListItem key={index} disableGutters>
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

        {!canDisplay && (
          <IconButton
            className="header__menu-button"
            onClick={toggleMenu}
            aria-label="toggle menu"
            size="large"
          >
            <MenuIcon />
          </IconButton>
        )}
      </nav>
    </Box>
  )
}

export default Header
