'use client';

import * as React from 'react';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import { Alert, AlertTitle, type SxProps, type Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

export interface DevelopmentBannerProps {
  /** Custom banner message */
  message?: string;
  /** Optional styling overrides */
  sx?: SxProps<Theme>;
  /** Whether the banner is fixed at top or bottom, or not fixed */
  fixed?: 'top' | 'bottom' | false;
}

export const DevelopmentBanner: React.FC<DevelopmentBannerProps> = ({
  message = 'This is a development environment. Features may be incomplete.',
  sx,
  fixed = false,
}) => {
  const positionStyles: SxProps<Theme> =
    fixed === 'top'
      ? { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }
      : fixed === 'bottom'
      ? { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 2000 }
      : {};

  const alertSx: SxProps<Theme> = (theme) => ({
    borderRadius: 0,
    px: 2,
    py: 1,
    fontSize: '0.875rem',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    border: `1px solid ${alpha(theme.palette.info.main, 0.5)}`,
    bgcolor:
      theme.palette.mode === 'dark'
        ? alpha(theme.palette.info.dark, 0.15)
        : alpha(theme.palette.info.light, 0.25),
    color:
      theme.palette.mode === 'dark'
        ? theme.palette.info.light
        : theme.palette.info.dark,
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    ...positionStyles,
    ...((sx as object) ?? {}),
  });

  return (
    <Alert
      icon={<AnnouncementIcon fontSize="small" />}
      severity="info"
      variant="outlined"
      sx={alertSx}
    >
      <AlertTitle sx={{ fontWeight: 600, mb: 0, lineHeight: 1.3 }}>
        Under Development
      </AlertTitle>
      <span>{message}</span>
    </Alert>
  );
};

export default DevelopmentBanner;
