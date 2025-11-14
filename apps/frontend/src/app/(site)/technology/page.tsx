// apps/frontend/src/app/(site)/technology/page.tsx

'use client';

import * as React from 'react';
import Script from 'next/script';
import { Box, Container, Typography, Grid } from '@mui/material';

import { Header, HelixCard } from '@helix-ai/ui';
import type { CardProps } from '@helix-ai/ui';
import { headerProps } from '../../../content/header';
import * as Constants from '../../../content/technology';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export default function Technology() {
  const allCards = React.useMemo<CardProps[]>(() => {
    const cards = Object.values(Constants).flat() as CardProps[];
    return cards.sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  React.useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignore errors in dev/preview
    }
  }, [allCards.length]);

  return (
    <main>
      {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
        <Script
          id="adsbygoogle-lib"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
          async
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      {process.env.NEXT_PUBLIC_ADSENSE_CLIENT &&
        (['left', 'right'] as const).map((side) => (
          <Box
            key={side}
            component="ins"
            className="adsbygoogle"
            sx={{
              display: { xs: 'none', lg: 'block' },
              position: 'fixed',
              top: '50%',
              [side]: 0,
              transform: 'translateY(-50%)',
              width: 120,
              height: 600,
              zIndex: 40,
            }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
            data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_TECH_SIDEBAR_SLOT}
            data-ad-format="vertical"
            data-full-width-responsive="false"
            aria-hidden="true"
          />
        ))}

      <Header {...headerProps} pages={headerProps.pages} />

      <Box
        component="section"
        sx={{
          pt: { xs: 8, sm: 10, md: 12, lg: 14 },
          pb: { xs: 4, md: 6 },
          minHeight: '20vh',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" sx={{ fontWeight: 700, mb: 2 }}>
            Technology
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{ color: 'text.secondary', maxWidth: 900, mx: 'auto' }}
          >
            Helix AI is built on modern, battle-tested technologies—selected for performance, reliability,
            scalability, and security. Explore the systems that power Helix—engineered to evolve, scale,
            and serve.
          </Typography>
        </Container>
      </Box>

      <Box component="section" sx={{ pb: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} alignContent="center" alignItems="stretch" justifyContent="center">
            {allCards.map((card, idx) => (
              <Grid
                key={`${card.title}-${card.link ?? idx}`}
                size={{ xs: 12, sm: 6, md: 4 }}
              >
                <HelixCard {...card} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </main>
  );
}
