// app/technology/layout.tsx

import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title:       'HelixAI Technologies | Advanced AI Solutions & Architecture',
  description: 'Discover HelixAI Technologies: innovative AI platforms, machine-learning infrastructure, and integrations that empower developers and enterprises to build intelligent applications at scale.',
  keywords: [
    'Helix AI Technologies',
    'AI solutions',
    'AI architecture',
    'machine learning',
    'deep learning',
    'NLP',
    'AI integrations',
    'enterprise AI',
    'developer AI tools',
  ],
  authors: [
    { name: 'SinLess Games LLC', url: 'https://sinlessgamesllc.com' }
  ],
  openGraph: {
    title:       'HelixAI Technologies | Advanced AI Solutions & Architecture',
    description: 'Explore HelixAI Technologies: cutting-edge AI platforms, ML infrastructure, and integrations designed for seamless enterprise and developer adoption.',
    url:         'https://helixai.com/technology',
    siteName:    'Helix AI',
    images: [
      {
        url:    'https://cdn.sinlessgamesllc.com/Helix-AI/images/Technology_Card.png',
        width:  1200,
        height: 630,
        alt:    'Helix AI Technologies overview',
      },
    ],
    locale:      'en_US',
    type:        'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Helix AI Technologies | Advanced AI Solutions & Architecture',
    description: 'Discover Helix AI Technologies: innovative AI platforms and integrations for developers and enterprises.',
    images:      ['https://cdn.sinlessgamesllc.com/Helix-AI/images/Technology_Card.png'],
    site:        '@Sinless777',
    creator:     '@Sinless777',
  },
  alternates:  { canonical: 'https://helixaibot.com/technology' },
  robots:      'index, follow',
}

export default function TechnologyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
