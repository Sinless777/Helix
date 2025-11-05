'use client';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import {
  Badge,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import * as React from 'react';

export type ProfileSectionKey = 'profile';

export interface SidebarItem {
  key: ProfileSectionKey;
  label: string;
  badge?: number;
}

const ICONS: Record<ProfileSectionKey, React.ReactNode> = {
  profile: <AccountCircleIcon fontSize="small" />,
};

export interface ProfileSidebarProps {
  items?: SidebarItem[];
  active?: ProfileSectionKey;
  onNavigate?: (key: ProfileSectionKey) => void;
  counts?: { supportTickets?: number };
  embedded?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * ProfileSidebar — compact navigation for profile pages.
 * Supports embedded (flat) or glass-styled rendering.
 */
export default function ProfileSidebar({
  items = [{ key: 'profile', label: 'Profile' }],
  active = 'profile',
  onNavigate,
  counts,
  embedded = false,
  sx,
}: ProfileSidebarProps) {
  const theme = useTheme();

  const glass = !embedded
    ? {
        bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.35 : 0.55),
        borderRadius: 3,
        backdropFilter: 'blur(10px) saturate(120%)',
        WebkitBackdropFilter: 'blur(10px) saturate(120%)',
        border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 8px 24px rgba(0,0,0,.35)'
            : '0 8px 24px rgba(0,0,0,.12)',
      }
    : { bgcolor: 'transparent' };

  return (
    <Box sx={{ p: 1, ...glass, ...sx }}>
      <Typography
        variant="subtitle2"
        sx={{
          opacity: 0.85,
          px: 1,
          pb: 0.75,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: theme.palette.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <DashboardCustomizeIcon fontSize="small" /> My Dashboard
      </Typography>

      <List disablePadding>
        {items.map((item) => {
          const IconNode = ICONS[item.key] ?? <AccountCircleIcon fontSize="small" />;
          const selected = active === item.key;
          const badge =
            item.key === 'profile' && counts?.supportTickets
              ? counts.supportTickets
              : item.badge;

          return (
            <ListItemButton
              key={item.key}
              selected={selected}
              onClick={() => onNavigate?.(item.key)}
              aria-current={selected ? 'page' : undefined}
              sx={{
                mx: 0.5,
                my: 0.25,
                borderRadius: 2,
                color: selected ? theme.palette.primary.main : theme.palette.text.primary,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  fontWeight: 600,
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
                transition: 'background-color 0.2s ease, color 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                {badge ? (
                  <Badge color="secondary" badgeContent={badge} max={9}>
                    {IconNode}
                  </Badge>
                ) : (
                  IconNode
                )}
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: selected ? 700 : 500,
                }}
                primary={item.label}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
