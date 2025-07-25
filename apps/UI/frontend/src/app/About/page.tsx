import { Header } from '../../components/Header'
import { AboutContent, headerProps } from '@helixai/core'
import { Box, Container, Typography, Grid } from '@mui/material'
import React from 'react'

// define the visual slot for each title
const orderMap: Record<string, number> = {
  'Meet the Team': 1,
  'Who We Are'   : 2,
  'Our Mission'  : 3,
  'Our Story'    : 4,
}

export default function AboutPage() {
  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <Header {...headerProps} />

      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 8, lg: 14 }, pb: { xs: 6, md: 10 } }}>
        <Typography
          variant="h3"
          component="h1"
          align="center"
          sx={{ fontWeight: 'bold', color: '#fff', mb: { xs: 4, md: 6 } }}
        >
          About Helix AI
        </Typography>

        <Grid container spacing={4}>
          {AboutContent.map(sec => (
            <Grid
              key={sec.title}
              size={{ xs: 12, sm: 6 }}
              order={{ xs: 0, sm: orderMap[sec.title] }}
            >
              <Box
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 2,
                  p: 3,
                }}
              >
                <Typography variant="h5" component="h2" gutterBottom>
                  {sec.title}
                </Typography>
                <Typography component="div" variant="body1" color="white">
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
