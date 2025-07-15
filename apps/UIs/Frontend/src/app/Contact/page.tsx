'use client'

import { Header } from '../../components'
import { headerProps } from '@helixai/core'
import { Button, Card, CardContent } from '@mui/material'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import React from 'react'

export default function ContactPage() {
  const contactOptions = [
    {
      title: 'Join Our Discord',
      description:
        'Connect with the community and get real-time support. Chat with the team, suggest ideas, and stay updated.',
      link: 'https://discord.gg/Za8MVstYnr',
      buttonText: 'Join Discord',
      image:
        'https://cdn.sinlessgamesllc.com/Helix-AI/images/Join-Our-Discord.png',
      bgColor: '#143256',
    },
    {
      title: 'Email Support',
      description:
        'Need help? Contact our support team directly. We typically respond within 24–48 hours.',
      link: 'mailto:support@helixaibot.com',
      buttonText: 'Send Email',
      image:
        'https://cdn.sinlessgamesllc.com/Helix-AI/images/Email-Support.png',
      bgColor: '#143256',
    },
    {
      title: 'Request a Feature',
      description:
        'Got an idea? Help shape the future of Helix AI by following our GitHub issue template.',
      link: 'https://github.com/SinLess-Games/Helix-AI/issues',
      buttonText: 'Submit Request',
      image:
        'https://cdn.sinlessgamesllc.com/Helix-AI/images/Request-a-Feature.png',
      bgColor: '#143256',
    },
    {
      title: 'Report a Bug',
      description:
        'Found something that doesn&apos;t work quite right? Let us know and we&apos;ll investigate promptly.',
      link: 'https://github.com/SinLess-Games/Helix-AI/issues/new?template=bug_report.md',
      buttonText: 'Report Bug',
      image: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Report-a-Bug.png',
      bgColor: '#143256',
    },
    {
      title: 'Give Feedback',
      description:
        'Your opinion matters. Share your thoughts on your experience with Helix AI and help us improve.',
      link: 'https://docs.google.com/forms/d/e/1FAIpQLSd8dEXyqvkMrkt4YOHqTwYw620qBXbT3R9MnWjDHEdOeX4EnA/viewform?usp=sharing', // Replace with actual form link
      buttonText: 'Leave Feedback',
      image:
        'https://cdn.sinlessgamesllc.com/Helix-AI/images/Give-Feedback.png',
      bgColor: '#143256',
    },
  ]

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header {...headerProps} />
      <Container
        maxWidth="lg"
        sx={{ pt: { xs: 4, md: 8, lg: 14 }, pb: { xs: 6, md: 10 } }}
      >
        <Typography
          variant="h3"
          align="center"
          sx={{ fontWeight: 'bold', color: '#fff', mb: 6 }}
        >
          Contact Us
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {contactOptions.map((option, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid #f6066f',
                  borderRadius: 2,
                  textAlign: 'center',
                  height: '100%',
                  p: 2,
                }}
              >
                <CardContent>
                  {option.image && (
                    <Box
                      sx={{
                        width: 250,
                        height: 250,
                        mx: 'auto',
                        mb: 3,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundColor: option.bgColor,
                        position: 'relative',
                        boxShadow: `
                          inset 0 0 15px rgba(255, 255, 255, 0.08),
                          0 0 12px ${option.bgColor}80
                        `,
                        border: `2px solid ${option.bgColor}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Image
                        src={option.image}
                        alt={option.title}
                        fill
                        style={{
                          objectFit: 'contain',
                          padding: '1rem',
                          mixBlendMode: 'normal',
                        }}
                      />
                    </Box>
                  )}
                  <Typography
                    variant="body2"
                    sx={{ color: 'white', fontSize: '1.0rem' }}
                    gutterBottom
                  >
                    {option.description}
                  </Typography>
                  <Button
                    variant="contained"
                    href={option.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 2 }}
                  >
                    {option.buttonText.toUpperCase()}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
