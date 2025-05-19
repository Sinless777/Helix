import React from 'react'
import Image from 'next/image'
import { Box } from '@mui/material'

export interface BackgroundImageProps {
  imageUrl: string
  altText: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({
  imageUrl,
  altText,
  style,
  children,
}) => {
  return (
    <>
      {/* Fixed full‐viewport container */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          backgroundColor: '#000', // fallback behind the image
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Image
          src={imageUrl}
          alt={altText}
          quality={100}
          fill
          priority
          style={{
            objectFit: 'fill', // show entire image
            objectPosition: 'center', // center it
          }}
        />
      </Box>

      {/* Content wrapper on top */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 0,
          ...style,
        }}
      >
        {children}
      </Box>
    </>
  )
}

export default BackgroundImage
