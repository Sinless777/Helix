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
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        minWidth: '100vw',
        overflow: 'hidden',
        ...style,
      }}
    >
      <Image
        src={imageUrl}
        alt={altText}
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
        style={{ zIndex: -1 }}
      />
      {children}
    </Box>
  )
}

export default BackgroundImage
