// apps/frontend/src/app/(site)/About/page.tsx

'use client';

import * as React from 'react';
import { Box, Grid, Typography } from '@mui/material';

import { Header, HelixCard } from '@helix-ai/ui';
import { AboutContent } from '../../../content/about';
import { headerProps } from '../../../content/header';

type AboutSection = {
  title: string;
  paragraphs: React.ReactNode | React.ReactNode[];
};

const ORDER_MAP: Record<string, string> = {
  'Meet the Team': 'order-0 sm:order-1',
  'Who We Are': 'order-0 sm:order-2',
  'Our Mission': 'order-0 sm:order-3',
  'Our Story': 'order-0 sm:order-4',
};

// Helper to flatten ReactNode[] into plain text
function nodesToPlainText(nodes: React.ReactNode[]): string {
  return nodes
    .flatMap((n) => {
      if (typeof n === 'string') {
        return n;
      }
      if (React.isValidElement(n)) {
        const maybeProps = (n.props as { children?: React.ReactNode });
        const child = maybeProps.children;
        if (typeof child === 'string') {
          return child;
        }
        if (Array.isArray(child)) {
          return child.map((c) => (typeof c === 'string' ? c : '')).filter(Boolean);
        }
      }
      return '';
    })
    .filter((str) => str.length > 0)
    .join('\n\n')
    .trim();
}

export default function AboutPage() {
  const sections = (AboutContent as AboutSection[]) ?? [];

  return (
    <Box component="div" sx={{ position: 'relative', minHeight: '100vh', color: 'white' }}>
      <Header {...headerProps} pages={[...headerProps.pages]} />

      <Box
        component="main"
        sx={{
          mx: 'auto',
          maxWidth: 1200,
          px: { xs: 2, sm: 3, lg: 4 },
          pb: { xs: 10, md: 14 },
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          align="center"
          sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 'bold',
            mb: { xs: 4, md: 6 },
          }}
        >
          About Helix AI
        </Typography>

        <Grid container spacing={4}>
          {sections.map((sec) => {
            const paras = Array.isArray(sec.paragraphs) ? sec.paragraphs : [sec.paragraphs];
            const description =
              paras.length === 1 && typeof paras[0] === 'string'
                ? paras[0]
                : nodesToPlainText(paras);

            const orderValue =
              parseInt(ORDER_MAP[sec.title]?.split('sm:order-')[1] ?? '0') || 0;

            return (
              <Grid
                key={sec.title}
                size={{ xs: 12, sm: 6 }}
                sx={{
                  padding: 1,
                  order: { xs: 0, sm: orderValue },
                }}
              >
                <HelixCard
                  title={sec.title}
                  description={description}
                  image=""
                  link=""
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    borderStyle: 'solid',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
}
