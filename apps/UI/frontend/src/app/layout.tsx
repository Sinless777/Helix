import React from 'react'
import './global.css'
import { BackgroundImage, type BackgroundImageProps } from '../components/Background'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title:       'Helix AI | Intelligent Digital Companion',
  description: 'Helix AI unifies your tools, simplifies workflows, and empowers decisions with adaptive, real-time insights powered by cutting-edge AI.',
  keywords:    [
    'Helix AI',
    'AI assistant',
    'digital companion',
    'workflow automation',
    'machine learning',
    'deep learning',
    'productivity AI'
  ],
  authors: [
    { name: 'SinLess Games LLC', url: 'https://sinlessgamesllc.com' }
  ],
  openGraph: {
    title:       'Helix AI | Intelligent Digital Companion',
    description: 'Helix AI unifies your tools, simplifies workflows, and empowers decisions with adaptive, real-time insights.',
    url:         'https://helixai.com',
    siteName:    'Helix AI',
    images: [
      {
        url:    'https://cdn.sinlessgamesllc.com/Helix-AI/images/Background.webp',
        width:  1200,
        height: 630,
        alt:    'Helix AI Background',
      }
    ],
    locale:      'en_US',
    type:        'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Helix AI | Intelligent Digital Companion for Workflow Automation',
    description: "Unify tools, simplify workflows, and empower decisions with Helix AI's real-time insights and adaptive intelligence.",
    images:      ['https://cdn.sinlessgamesllc.com/Helix-AI/images/Background.webp'],
    site:        '@Sinless777',
    creator:     '@Sinless777',
  },
  viewport:        'width=device-width, initial-scale=1',
  alternates: {
    canonical:   'https://helixai.com',
  },
  robots:          'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const backgroundImageProps: BackgroundImageProps = {
    imageUrl: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Background.webp',
    altText: 'background',
  }

  return (
    <html lang="en">
      <head></head>
      <body>
        <BackgroundImage {...backgroundImageProps}>{children}</BackgroundImage>
      </body>
    </html>
  )
}
