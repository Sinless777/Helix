import React from 'react'
import './global.css'
import {
  BackgroundImage,
  BackgroundImageProps,
} from '../components/Background'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { SystemColors } from '@helixai/core'
import Script from 'next/script'

export const metadata = {
  title: 'Helix AI',
  description: '',
}

const backgroundImageProps: BackgroundImageProps = {
  imageUrl: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Background.webp',
  altText: 'background',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const color = SystemColors.reset

  console.log(color)
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-EXCL6FMDHY"
        ></Script>
        <Script
          id="google-analytics-init"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-EXCL6FMDHY');
            `,
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9610840170359196"
        />
        <meta name="google-adsense-account" content="ca-pub-9610840170359196" />
      </head>
      <body>
        <ErrorBoundary>
          <BackgroundImage {...backgroundImageProps}>
            {children}
          </BackgroundImage>
        </ErrorBoundary>
      </body>
    </html>
  )
}
