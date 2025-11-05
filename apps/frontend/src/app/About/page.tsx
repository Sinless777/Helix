'use client';

import { Box, Grid } from '@mui/material';
import React from 'react';

import { HelixCard } from '@helix/ui';  // Correctly import from @helix/ui
import { Header } from '@helix/ui';  // Correctly import Header from @helix/ui
import { AboutContent } from '../../content/about';
import { headerProps } from '../../content/header';

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

// Helper to flatten ReactNode[] into plain text for HelixCard.description
function nodesToPlainText(nodes: React.ReactNode[]): string {
  return nodes
    .map((n) =>
      typeof n === 'string'
        ? n
        : React.isValidElement(n) &&
            typeof (n as React.ReactElement<{ children?: React.ReactNode }>).props.children ===
              'string'
          ? ((n as React.ReactElement<{ children?: React.ReactNode }>).props.children as string)
          : ''
    )
    .filter((str) => str.length > 0)
    .join('\n\n')
    .trim();
}

export default function AboutPage() {
  const sections = (AboutContent as AboutSection[]) ?? [];

  return (
    <Box component="div" sx={{ position: 'relative', minHeight: '100vh', color: 'white' }}>
      <Header {...headerProps} pages={[...(headerProps.pages ?? [])]} />

      <Box
        component="main"
        sx={{ mx: 'auto', maxWidth: 1200, px: { xs: 2, sm: 3, lg: 4 }, pb: { xs: 10, md: 14 } }}
      >
        <Box
          component="h1"
          sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 'bold',
            textAlign: 'center',
            mb: { xs: 4, md: 6 },
          }}
        >
          About Helix AI
        </Box>

        <Grid container spacing={4}>
          {sections.map((sec) => {
            const paras = Array.isArray(sec.paragraphs) ? sec.paragraphs : [sec.paragraphs];
            const description =
              paras.length === 1 && typeof paras[0] === 'string'
                ? (paras[0] as string)
                : nodesToPlainText(paras);

            return (
              <Grid
                size={{ xs: 12, sm: 6 }}
                spacing={{ xs: 2, sm: 4, md: 6, lg: 8 }}
                key={sec.title}
                sx={{
                  // apply ordering only on sm+ as defined
                  order: {
                    xs: 0,
                    sm: parseInt(ORDER_MAP[sec.title]?.split('sm:order-')[1] ?? '0'),
                  },
                  padding: 1,
                }}
              >
                <HelixCard
                  title={sec.title}
                  description={description}
                  image="" // no image
                  link="" // no link
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
