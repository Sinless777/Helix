'use client'
import { Header } from '../../components'
import { AboutContent, headerProps } from '@helixai/core'
import { Box, Container, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import { motion } from 'framer-motion'
import Script from 'next/script'
import React from 'react'


export default function AboutPage() {

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Google Ads Init */}
      <Script id="ads-init" strategy="afterInteractive">
        {`(adsbygoogle=window.adsbygoogle||[]).push({});`}
      </Script>

      {/* Ad Slots */}
      {['left', 'right'].map((side) => (
        <Box
          key={side}
          component="ins"
          className="adsbygoogle"
          sx={{
            position: 'fixed',
            top: '50%',
            [side]: 0,
            transform: 'translateY(-50%)',
            width: 120,
            height: 600,
            zIndex: 1000,
            display: { xs: 'none', lg: 'block' },
          }}
          data-ad-client="ca-pub-REPLACE_WITH_YOUR_CLIENT_ID"
          data-ad-slot={`REPLACE_${side.toUpperCase()}_SLOT_ID`}
          data-ad-format="auto"
        />
      ))}

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
              {/* Card Animation */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.2 }}
                whileHover={{ scale: 1.03 }}
              >
                <Box
                  component="div"
                  sx={{ height: 360, overflowY: 'auto', p: 2 }}
                >
                  <Typography variant="h5">
                    <span>{sec.icon || '🔹'}</span>
                    {sec.title}
                  </Typography>

                  <Typography variant="body1" component="div">
                    {sec.content}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
