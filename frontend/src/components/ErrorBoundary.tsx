// src/components/ErrorBoundary.tsx
'use client'

import React from 'react'
import { Header } from '@/components/Header'
import { headerProps } from '@/constants/header'
import { Box, Typography, Button } from '@mui/material'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff' }}>
          <Header {...headerProps} />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100vh - 64px)',
              textAlign: 'center',
              px: 2,
            }}
          >
            <Typography variant="h4" gutterBottom>
              Oops! Something went wrong.
            </Typography>
            <Typography variant="body1" gutterBottom>
              An unexpected error has occurred.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleReset}
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              href="/"
              sx={{ mt: 2 }}
            >
              Go to Home
            </Button>
          </Box>
        </Box>
      )
    }

    return this.props.children
  }
}
