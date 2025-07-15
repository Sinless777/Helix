// src/app/Docs/[...slug]/page.tsx
import DocsLayout from '../../components/Docs'
import { DocsTheme } from '@helixai/core'
import { ThemeProvider } from '@mui/material/styles'

export default function DocsPage({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={DocsTheme}>
      <DocsLayout>{children}</DocsLayout>
    </ThemeProvider>
  )
}
