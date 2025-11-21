// libs/ui/src/components/Header.tsx

'use client';

import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Link as MuiLink,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import * as React from 'react';
import { useSession } from 'next-auth/react';

import styles from './Header.module.scss';

import { LoginButton, SignupButton } from '@helix-ai/ui';

export interface Page {
  name: string;
  url: string;
}

export interface HeaderProps {
  logo: string;
  version: string;
  pages: Page[];
  style?: React.CSSProperties;
}

const Header: React.FC<HeaderProps> = ({ logo, version, pages, style }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [latestVersion, setLatestVersion] = React.useState<string | null>(null);

  const [pathname, setPathname] = React.useState<string>('');
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const { data: session } = useSession();

  // Hypertune removed from this lib to avoid cross-lib deps; assume permissions are enabled.
  const permissionsEnabled = true;

  React.useEffect(() => {
    setPathname(window.location.pathname);
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          'https://api.github.com/repos/Sinless777/Helix/releases/latest'
        );
        if (!res.ok) throw new Error('bad status');
        const data = await res.json();
        const tag: string = data?.tag_name ?? '';
        if (!cancelled)
          setLatestVersion(tag.replace(/^v/i, '') || null);
      } catch {
        if (!cancelled) setLatestVersion(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayVersion = latestVersion ?? version;
  const releaseUrl = `https://github.com/Sinless777/Helix/releases/tag/v${displayVersion}`;

  const go = (href: string) => {
    setPathname(href);
    if (typeof window !== 'undefined') {
      window.location.href = href;
    }
  };
  const goAndClose = (href: string) => {
    setMenuOpen(false);
    setPathname(href);
    if (typeof window !== 'undefined') {
      window.location.href = href;
    }
  };

  return (
    <>
      <Box component="header" className={styles.header} style={style}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 1280,
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4, lg: 5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Logo + Version */}
          <Stack direction="row" spacing={2}>
            <Box
              role="link"
              aria-label="Helix Home"
              onClick={() => go('/')}
              sx={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Image src={logo} alt="Helix logo" width={120} height={40} priority />
            </Box>

            <MuiLink
              href={releaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: '0.85rem',
                '&:hover': {
                  color: '#fff',
                  fontWeight: 700,
                  textShadow: '0 0 6px rgba(2,35,113,0.6)',
                },
                alignSelf: 'center',
              }}
            >
              V{displayVersion}
            </MuiLink>
          </Stack>

          {/* Navigation */}
          {mdUp && (
            <Stack
              component="nav"
              direction="row"
              sx={{
                flexGrow: 1,
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                columnGap: { md: 2.25, lg: 3 },
                rowGap: 0.75,
                minWidth: 0,
                px: 1,
              }}
            >
              {pages.map((p) => {
                const active = pathname === p.url;
                return (
                  <Button
                    key={p.name}
                    onClick={() => go(p.url)}
                    sx={{
                      color: 'inherit',
                      fontWeight: active ? 700 : 500,
                      textDecorationThickness: active ? '2px' : undefined,
                      whiteSpace: 'nowrap',
                      textTransform: 'none',
                      px: 1,
                      minWidth: 0,
                    }}
                  >
                    {p.name}
                  </Button>
                );
              })}
            </Stack>
          )}

          {/* Auth buttons or menu toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {permissionsEnabled && (
              <>
                <LoginButton className="auth-btn" />
                {!session && <SignupButton className="auth-btn" />}
              </>
            )}

            {!mdUp && (
              <IconButton
                onClick={() => setMenuOpen(true)}
                sx={{ color: '#fff' }}
                aria-label="Open menu"
              >
                <MenuIcon fontSize="large" />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>

      {/* Drawer for mobile */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{ sx: { width: 300, bgcolor: '#1f1f2a', color: '#fff' } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 2 }}>
          <Typography variant="subtitle1">Menu</Typography>
          <IconButton
            onClick={() => setMenuOpen(false)}
            sx={{ color: '#fff' }}
            aria-label="Close menu"
          >
            <CloseIcon />
          </IconButton>
        </Stack>

        <List component="nav">
          {pages.map((p) => {
            const active = pathname === p.url;
            return (
              <ListItem key={p.name} disablePadding>
                <ListItemButton
                  onClick={() => goAndClose(p.url)}
                  selected={active}
                  sx={{
                    color: 'inherit',
                    '&.Mui-selected': { bgcolor: 'rgba(255,255,255,.08)' },
                  }}
                >
                  <ListItemText primary={p.name} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      <Box sx={{ height: { xs: 64, md: 68 } }} />
    </>
  );
};

export default Header;
