'use client';

import {
  Avatar,
  Box,
  Chip,
  Divider,
  Typography,
  useTheme,
  type SxProps,
  type Theme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

export interface ProfileCardProps {
  name: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string;
  status?: string;
  joinedAt?: string;
  sx?: SxProps<Theme>;
}

/**
 * ProfileCard — clean, responsive glassmorphic profile summary.
 */
export function ProfileCard({
  name,
  username,
  bio,
  avatarUrl,
  status,
  joinedAt,
  sx,
}: ProfileCardProps) {
  const theme = useTheme();

  const glass = {
    bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.3 : 0.6),
    borderRadius: 3,
    border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 8px 32px rgba(0,0,0,0.35)'
        : '0 8px 32px rgba(0,0,0,0.12)',
    backdropFilter: 'blur(16px) saturate(140%)',
    WebkitBackdropFilter: 'blur(16px) saturate(140%)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow:
        theme.palette.mode === 'dark'
          ? '0 10px 40px rgba(0,0,0,0.5)'
          : '0 10px 40px rgba(17,25,40,0.2)',
    },
  } as const;

  return (
    <Box
      sx={{
        maxWidth: 600,
        width: '100%',
        p: { xs: 2, sm: 3 },
        ...glass,
        ...sx,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Avatar
          src={avatarUrl}
          alt={name}
          sx={{
            width: 72,
            height: 72,
            fontSize: 28,
            fontWeight: 600,
            bgcolor: theme.palette.primary.main,
          }}
        >
          {name.charAt(0).toUpperCase()}
        </Avatar>

        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, lineHeight: 1.2, color: theme.palette.text.primary }}
          >
            {name}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            @{username}
          </Typography>

          {status && (
            <Chip
              label={status}
              size="small"
              color="secondary"
              sx={{
                mt: 0.5,
                fontWeight: 500,
                textTransform: 'capitalize',
                bgcolor: alpha(theme.palette.secondary.main, 0.15),
              }}
            />
          )}
        </Box>
      </Box>

      {/* Bio */}
      {bio && (
        <Typography
          variant="body1"
          sx={{
            mt: 2,
            fontSize: '0.95rem',
            lineHeight: 1.6,
            color: theme.palette.text.primary,
            whiteSpace: 'pre-line',
          }}
        >
          {bio}
        </Typography>
      )}

      <Divider sx={{ my: 2, opacity: 0.25 }} />

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          alignItems: 'center',
          color: theme.palette.text.secondary,
          fontSize: '0.875rem',
        }}
      >
        <Typography variant="body2">
          {joinedAt ? `Joined ${new Date(joinedAt).toLocaleDateString()}` : '—'}
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.8 }}>
          ID: @{username.toLowerCase()}
        </Typography>
      </Box>
    </Box>
  );
}

export default ProfileCard;
