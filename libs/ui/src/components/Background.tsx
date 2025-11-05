'use client';

import * as React from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import Image from 'next/image';

export interface BackgroundImageProps {
  /** Background image URL */
  imageUrl: string;
  /** Alt text for the image */
  altText?: string;
  /** Optional style overrides for the foreground wrapper */
  sx?: SxProps<Theme>;
  /** Optional overlay opacity (0 = transparent, 1 = fully dark) */
  overlayOpacity?: number;
  /** Optional children to render on top */
  children?: React.ReactNode;
  /** Optional background blur intensity (px) */
  blur?: number;
}

/**
 * BackgroundImage — a fixed full-viewport background with overlay and foreground content.
 */
export const BackgroundImage: React.FC<BackgroundImageProps> = ({
  imageUrl,
  altText = '',
  sx,
  overlayOpacity = 0.4,
  blur = 0,
  children,
}) => {
  return (
    <>
      {/* Background layer */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: -2,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
            backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
            WebkitBackdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
            zIndex: 1,
          },
        }}
      >
        <Image
          src={imageUrl}
          alt={altText}
          fill
          priority
          quality={100}
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </Box>

      {/* Foreground container */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 0,
          ...sx,
        }}
      >
        {children}
      </Box>
    </>
  );
};

export default BackgroundImage;
