import './global.css'
import { BackgroundImage, BackgroundImageProps } from '@/components/Background'
import { SystemColors } from '@/constants/system'
import { ErrorBoundary } from '@/components/ErrorBoundary'


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
