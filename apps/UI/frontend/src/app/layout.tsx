import React from 'react'
import './global.css'
import { BackgroundImage, BackgroundImageProps } from '../components/Background'

export const metadata = {
  title: 'Helix AI',
  description: '',
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
