// apps/frontend/src/app/layout.tsx
import * as React from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import dynamic from 'next/dynamic';

const Background = dynamic(() => import('@helix-ai/ui').then((mod) => ({ default: mod.Background })));

const AppProviders = dynamic(() => import('./providers').then((mod) => ({ default: mod.AppProviders })));

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

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  const mode: 'dark' | 'light' = 'dark';
  const showMeticulousSnippet =
    process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview';

  return (
    <html lang="en" className={mode === 'dark' ? 'dark' : ''} style={{ colorScheme: mode }}>
      <head>
        {/* Analytics snippet for dev/preview */}
        {showMeticulousSnippet && (
          <Script
            id="meticulous-analytics"
            strategy="beforeInteractive"
            src="https://snippet.meticulous.ai/v1/meticulous.js"
            data-recording-token="mxGHRESvuU68b8edOcewbT25c8mElDmQWedof3QS"
            data-is-production-environment="false"
          />
        )}
      </head>
      <body className="antialiased bg-black text-white">
        <Analytics />
        <SpeedInsights />
        <Background
          imageUrl="https://cdn.sinlessgamesllc.com/Helix-AI/images/Background.webp"
          altText="Background Image"
        >
          <AppProviders defaultMode={mode}>{children}</AppProviders>
        </Background>
      </body>
    </html>
  );
}
