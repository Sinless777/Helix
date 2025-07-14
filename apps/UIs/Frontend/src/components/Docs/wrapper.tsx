'use client'

import { Header } from '../Header'
import { headerProps } from '@helixai/core'
import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import React, { useEffect, useState } from 'react'
import DocsSidebar from './sidebar'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <Header {...headerProps} />

      {/* Main layout container */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100%',
          pt: 12,
        }}
      >
        {/* Mobile AppBar */}
        {isMobile && (
          <AppBar position="sticky" sx={{ bgcolor: '#1A1B25' }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open sidebar"
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" color="inherit">
                Docs
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        {/* Content and sidebar */}
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            overflow: 'hidden',
            flexDirection: 'row',
          }}
        >
          {/* Sidebar drawer on mobile */}
          {isMobile ? (
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
              ModalProps={{ keepMounted: true }}
              PaperProps={{
                sx: {
                  bgcolor: '#121827',
                  color: 'white',
                  width: 280,
                },
              }}
            >
              <Box
                sx={{ width: '100%', height: '100%' }}
                role="presentation"
                onClick={toggleDrawer(false)}
              >
                <DocsSidebar />
              </Box>
            </Drawer>
          ) : (
            <Box
              sx={{
                flex: '0 0 clamp(200px, 20%, 300px)',
                flexShrink: 0,
                bgcolor: '#121827',
                overflowY: 'auto',
              }}
            >
              <DocsSidebar />
            </Box>
          )}

          {/* Main Markdown/Content area */}
          <Box
            sx={{
              overflowY: 'auto',
              p: 3,
              bgcolor: 'rgba(16, 17, 18, 0.5)',
              color: '#FAFAFA',
              flex: '1 1 auto',
            }}
          >
            {children}
          </Box>

          {/* Optional Info panel */}
          {!isMobile && (
            <Box
              sx={{
                flex: '0 0 clamp(150px, 15%, 260px)',
                flexShrink: 0,
                bgcolor: '#121827',
                borderLeft: '1px solid #1F2937',
                display: { xs: 'none', sm: 'block' },
                px: 2,
                py: 3,
              }}
            >
              <Typography variant="subtitle2" color="#888" gutterBottom>
                Ad / Info
              </Typography>
              <Typography variant="body2" color="#aaa">
                You can place release notes, changelogs, or Discord links here.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
