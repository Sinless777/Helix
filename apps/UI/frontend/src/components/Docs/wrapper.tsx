// src/app/docs/layout.tsx
'use client'

import React, { useEffect } from 'react'
import { Header } from '../Header'
import { headerProps } from '@helixai/core'
import { Box, Typography } from '@mui/material'
import DocsSidebar from './sidebar'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Height of your header in px (mt:10 → 10 * 8px = 80px)
  const headerHeight = 80

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100 }}>
        <Header {...headerProps} />
      </Box>

      {/* Main content area */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          pt: `${headerHeight}px`,        // push below header
          height: `calc(100vh - ${headerHeight}px)`,
        }}
      >
        {/* Sidebar */}
        <Box
          component="nav"
          sx={{
            flex: '0 0 clamp(200px, 20%, 300px)',
            bgcolor: '#121827',
            position: 'sticky',
            top: `${headerHeight}px`,
            alignSelf: 'flex-start',
            height: `calc(100vh - ${headerHeight}px)`,
            overflowY: 'auto',
          }}
        >
          <DocsSidebar />
        </Box>

        {/* Document content */}
        <Box
          sx={{
            flex: '1 1 auto',
            overflowY: 'auto',
            p: 3,
            bgcolor: 'rgba(16, 17, 18, 0.5)',
            color: '#FAFAFA',
          }}
        >
          {children}
        </Box>

        {/* Info panel */}
        <Box
          component="aside"
          sx={{
            flex: '0 0 clamp(150px, 15%, 260px)',
            bgcolor: '#121827',
            borderLeft: '1px solid #1F2937',
            display: { xs: 'none', sm: 'block' },
            position: 'sticky',
            top: `${headerHeight}px`,
            alignSelf: 'flex-start',
            height: `calc(100vh - ${headerHeight}px)`,
            px: 2,
            py: 3,
            overflowY: 'auto',
          }}
        >
          <Typography variant="subtitle2" color="#888" gutterBottom>
            Ad / Info
          </Typography>
          <Typography variant="body2" color="#aaa">
            You can place release notes, changelogs, or Discord links here.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
