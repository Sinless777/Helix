// src/app/Docs/[...slug]/page.tsx
'use client'

import DocsLayout from '@helixai/frontend/components/Docs'
import { themes } from '@helixai/frontend/constants'
import { ThemeProvider } from '@mui/material/styles'

export default function DocsPage({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={themes.DocsTheme}>
      <DocsLayout>{children}</DocsLayout>
    </ThemeProvider>
  )
}
