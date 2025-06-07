import './global.css'
import { BackgroundImage, BackgroundImageProps } from '@/components/Background'
import { SystemColors } from '@/constants/system'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
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
        {(process.env.NODE_ENV === 'development' ||
          process.env.VERCEL_ENV === 'preview') && (
          <Script
            data-recording-token="mxGHRESvuU68b8edOcewbT25c8mElDmQWedof3QS"
            data-is-production-environment="false"
            src="https://snippet.meticulous.ai/v1/meticulous.js"
          />
        )}
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
      </head>
      <body>
        <Analytics />
        <ErrorBoundary>
          <BackgroundImage {...backgroundImageProps}>
            {children}
          </BackgroundImage>
        </ErrorBoundary>
        <SpeedInsights />
      </body>
    </html>
  )
}
