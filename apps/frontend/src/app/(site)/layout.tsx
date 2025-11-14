// apps/frontend/src/app/(site)/layout.tsx

import * as React from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import { Background } from '@helix-ai/ui';
import { AppProviders } from '../providers';

type SiteLayoutProps = {
  children: React.ReactNode;
};

export default function SiteLayout({ children }: SiteLayoutProps) {
  const mode: 'dark' | 'light' = 'dark';
  const showMeticulousSnippet =
    process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview';

  return (
    <>
      {showMeticulousSnippet && (
        <Script
          id="meticulous-analytics"
          strategy="beforeInteractive"
          src="https://snippet.meticulous.ai/v1/meticulous.js"
          data-recording-token="mxGHRESvuU68b8edOcewbT25c8mElDmQWedof3QS"
          data-is-production-environment="false"
        />
      )}
      <Analytics />
      <SpeedInsights />
      <Background
        imageUrl="https://cdn.sinlessgamesllc.com/Helix-AI/images/Background.webp"
        altText="Background Image"
      >
        <AppProviders defaultMode={mode}>{children}</AppProviders>
      </Background>
    </>
  );
}
