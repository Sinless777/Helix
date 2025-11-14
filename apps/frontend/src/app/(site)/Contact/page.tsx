// apps/frontend/src/app/(site)/Contact/page.tsx

'use client';

import * as React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';

import { Header, HelixCard } from '@helix-ai/ui';
import { CONTACT_OPTIONS } from '../../../content/contact';
import { headerProps } from '../../../content/header';

export default function ContactPage() {
  return (
    <main>
      <Header {...headerProps} pages={[...headerProps.pages]} />

      <Box
        component="section"
        sx={{
          pt: { xs: 8, sm: 10, md: 12, lg: 14 },
          pb: { xs: 4, md: 6 },
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" sx={{ fontWeight: 700, mb: 3 }}>
            Contact Us
          </Typography>

          <Grid container spacing={2} sx={{ alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
            {CONTACT_OPTIONS.map((option) => (
              <Grid key={option.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <HelixCard
                  title={option.title}
                  description={option.description}
                  image={option.image ?? ''}
                  link={option.link}
                  buttonText={option.buttonText}
                  sx={{
                    borderColor: option.bgColor ?? undefined,
                    ...(option.bgColor ? { backgroundColor: 'rgba(0,0,0,0.40)' } : {}),
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </main>
  );
}
