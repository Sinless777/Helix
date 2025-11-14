// apps/frontend/src/app/(site)/technology/[link]/page.tsx

'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Box, Button, Container, Grid, Typography } from '@mui/material';

import { Header, HelixCard } from '@helix-ai/ui';
import type { CardProps, ListItemProps } from '@helix-ai/ui';
import { headerProps } from '../../../../content/header';
import * as technology from '../../../../content/technology';

// Normalize a path string for comparison
function norm(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return p.toLowerCase();
}

function getAllCards(): CardProps[] {
  return (Object.values(technology).flat() as CardProps[]).filter(Boolean);
}

export default function TechnologyDetailPage() {
  const params = useParams<{ link: string }>();
  const link = params?.link ?? '';
  const slug = decodeURIComponent(link);
  const target = norm(`/technology/${slug}`);

  const allCards = React.useMemo(() => getAllCards(), []);
  const matchedCard = allCards.find((c) => norm(c.link ?? '') === target);

  if (!matchedCard) {
    return (
      <main>
        <Header {...headerProps} pages={[...headerProps.pages]} />
        <Container maxWidth="md" sx={{ textAlign: 'center', pt: { xs: 10, md: 14 } }}>
          <Typography variant="h4" gutterBottom>
            Oops — page not found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We couldn&apos;t find a technology matching <strong>{slug}</strong>.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" href="/technology">
              Back to Technologies
            </Button>
          </Box>
        </Container>
      </main>
    );
  }

  const { title, description, listItems } = matchedCard;

  return (
    <main>
      <Header {...headerProps} pages={[...headerProps.pages]} />

      <Box
        component="section"
        sx={{
          pt: { xs: 8, sm: 10, md: 12, lg: 14 },
          pb: { xs: 4, md: 6 },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            textAlign: 'center',
          }}
        >
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 900, mx: 'auto' }}>
              {description}
            </Typography>
          )}
        </Container>
      </Box>

      <Box component="section" sx={{ pb: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} alignContent="center" alignItems="stretch" justifyContent="center">
            {(listItems as ListItemProps[] | undefined)?.map((item, idx) => (
              <Grid key={`${item.href ?? ''}-${idx}`} size={{ xs: 12, sm: 6, md: 4 }}>
                <HelixCard
                  title={item.text}
                  image={item.image ?? ''}
                  description={item.detailedDescription}
                  link={item.href ?? ''}
                  sx={{ height: '30rem' }}
                />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              href="/technology"
              sx={{ px: 4, py: 1.5, fontWeight: 600, borderRadius: 2 }}
            >
              Back to Technologies
            </Button>
          </Box>
        </Container>
      </Box>
    </main>
  );
}
