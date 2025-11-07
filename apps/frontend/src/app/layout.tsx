// apps/frontend/src/app/layout.tsx
import 'server-only'

import * as React from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import { HelixProviders, Background } from '@helix/ui';

export const metadata: Metadata = {
  metadataBase: new URL('https://helixai.com'),
  title: { default: 'Helix AI', template: '%s | Helix AI' },
  description:
    'Helix AI is your adaptive digital companion — connect, automate, and analyze across your ecosystem.',
  keywords: [
    'Helix AI',
    'AI assistant',
    'automation',
    'productivity',
    'Convex',
    'Clerk',
    'Next.js',
  ],
  applicationName: 'Helix AI',
  authors: [{ name: 'SinLess Games LLC', url: 'https://sinlessgamesllc.com' }],
  creator: 'SinLess Games LLC',
  publisher: 'SinLess Games LLC',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://helixai.com' },
  openGraph: {
    title: 'Helix AI',
    description:
      'Your adaptive digital companion — connect, automate, and analyze across your ecosystem.',
    url: 'https://helixai.com',
    siteName: 'Helix AI',
    images: [
      {
        url: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Helix_OG.png',
        width: 1200,
        height: 630,
        alt: 'Helix AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Sinless777',
    creator: '@Sinless777',
    title: 'Helix AI',
    description:
      'Your adaptive digital companion — connect, automate, and analyze across your ecosystem.',
    images: ['https://cdn.sinlessgamesllc.com/Helix-AI/images/Helix_OG.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

type RootLayoutProps = { children: React.ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
  const mode: 'dark' | 'light' = 'dark';

  return (
    <html
      lang="en"
      className={mode === 'dark' ? 'dark' : ''}
      style={{ colorScheme: mode }}
      suppressHydrationWarning
    >
      <head />
      <body className="antialiased bg-black text-white">
        <Analytics />
        <SpeedInsights />
          <Background
            imageUrl="https://cdn.sinlessgamesllc.com/Helix-AI/images/Background.webp"
            altText="Background Image"
          >
            <HelixProviders defaultMode={mode}>
              {children}
            </HelixProviders>
          </Background>
      </body>
    </html>
  );
}
