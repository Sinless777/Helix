'use client';

import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  Stack,
  Tooltip,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import * as React from 'react';

export interface ProfileTopbarProps {
  user: { name: string; avatarUrl?: string };
  userId?: string;
  embedded?: boolean;
  sx?: SxProps<Theme>;
}

export default function ProfileTopbar({
  user,
  userId,
  embedded = false,
  sx,
}: ProfileTopbarProps) {
  const theme = useTheme();

  // Temporarily stub notifications since useNotifications has been removed
  const notifications: Array<{ _id: string; title: string; message: string; read: boolean }> = [];
  const markRead = (_id: string) => {
    /* no-op */
  };
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleBellClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleMarkRead = (notificationId: string) => markRead(notificationId);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: embedded ? 0 : 3,
        p: embedded ? 0 : 1.5,
        bgcolor: embedded
          ? 'transparent'
          : alpha(theme.palette.background.paper, 0.6),
        backdropFilter: embedded ? undefined : 'blur(8px)',
        WebkitBackdropFilter: embedded ? undefined : 'blur(8px)',
        border: embedded
          ? 'none'
          : `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.2 : 0.1)}`,
        boxShadow: embedded ? 'none' : theme.shadows[3],
        ...sx,
      }}
    >
      <Box>
        <Typography variant="h6" fontWeight={700} lineHeight={1.1}>
          Hello, {user.name}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Welcome back!
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title="Messages" arrow>
          <IconButton size="small" aria-label="messages">
            <MailOutlineIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Notifications" arrow>
          <IconButton
            size="small"
            aria-label="notifications"
            onClick={handleBellClick}
            sx={{ position: 'relative' }}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.65rem',
                  minWidth: 16,
                  height: 16,
                },
              }}
            >
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            width: 320,
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Notifications
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You’re all caught up!'}
          </Typography>
        </Box>

        <Divider sx={{ opacity: 0.3, mb: 0.5 }} />

        {notifications.length > 0 ? (
          <List dense disablePadding>
            {notifications.map((notif) => (
              <ListItem
                key={notif._id}
                sx={{
                  px: 2,
                  py: 1,
                  alignItems: 'flex-start',
                  bgcolor: notif.read ? 'transparent' : alpha(theme.palette.primary.main, 0.08),
                }}
              >
                <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                  {!notif.read ? (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'error.main',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'transparent',
                      }}
                    />
                  )}
                </ListItemIcon>

                <ListItemText primary={notif.title} secondary={notif.message} />

                <ListItemSecondaryAction>
                  {!notif.read && (
                    <Button size="small" onClick={() => handleMarkRead(notif._id)}>
                      Mark read
                    </Button>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <ListItem sx={{ px:2, py:1 }}>
            <ListItemText primary="No notifications" />
          </ListItem>
        )}

        <ListItem sx={{ px:2, py:1 }}>
          <Button fullWidth onClick={handleMenuClose}>
            Close
          </Button>
        </ListItem>
      </Menu>
    </Box>
  );
}
