import React, { useState, useEffect } from 'react'
import { HeaderProps, Page } from './header.types'
import Image from 'next/image'
import './header.scss'

export const Header: React.FC<HeaderProps> = ({
  logo,
  title,
  version,
  pages,
  style,
  menuOpen,
  toggleMenu,
}) => {
  const [canDisplay, setCanDisplay] = useState(false)

  useEffect(() => {
    // Function to check if pages fit within 1/3 of the header width
    const checkDisplayPages = () => {
      const headerWidth = window.innerWidth
      const maxPagesWidth = headerWidth / 3
      const totalPagesWidth = pages.reduce(
        (total, page) => total + page.name.length * 8,
        0,
      ) // Approx width per character
      setCanDisplay(totalPagesWidth <= maxPagesWidth)
    }

    // Perform the check initially and on window resize
    checkDisplayPages()
    window.addEventListener('resize', checkDisplayPages)

    return () => {
      window.removeEventListener('resize', checkDisplayPages)
    }
  }, [pages])

  return (
    <header className="header" style={style}>
      {/* Left Section: Logo, Title, Version */}
      <div id="Title-Logo-Version" className="header__left">
        <Image
          src={logo}
          alt={`${title} logo`}
          className="header__logo"
          height={50}
          width={50}
        />
        <div className="header__title">{title}</div>
        <div className="header__version">V {version}</div>
      </div>

      {/* Middle Section: Empty to maintain 1/3rd spacing */}
      <div className="header__middle"></div>

      {/* Right Section: Navigation or Hamburger Menu */}
      <nav className="header__nav">
        <ul
          className={`header__nav-list ${
            menuOpen ? 'header__nav-list--open' : ''
          } ${canDisplay ? '' : 'hidden'}`}
        >
          {/* Display page links if they fit within 1/3rd of the header */}
          {canDisplay &&
            pages.map((page: Page, index) => (
              <li key={index}>
                <a href={page.url}>{page.name}</a>
              </li>
            ))}
        </ul>
        {/* Hamburger Menu: Only visible when pages don't fit */}
        {!canDisplay && (
          <button className="header__menu-button" onClick={toggleMenu}>
            ☰
          </button>
        )}
      </nav>
    </header>
  )
}

export default Header
