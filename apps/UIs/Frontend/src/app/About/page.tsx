import { Header } from '../../components'
import { AboutContent, headerProps } from '@helixai/core'
import { Box, Container, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import React from 'react'

export default function AboutPage() {

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Header */}
      <Header {...headerProps} />

      {/* Content */}
      <Container
        maxWidth="lg"
        sx={{ pt: { xs: 4, md: 8, lg: 14 }, pb: { xs: 6, md: 10 } }}
      >
        <Typography
          variant="h3"
          component="h1"
          align="center"
          sx={{
            fontWeight: 'bold',
            color: '#fff',
            mb: { xs: 4, md: 6 },
          }}
        >
          About Helix AI
        </Typography>

        <Grid container spacing={4}>
          {AboutContent.map((sec, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  p: 3,
                  mb: 4,
                }}
              >
                <Typography variant="h5" component="h2" gutterBottom>
                  {sec.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {sec.content}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
