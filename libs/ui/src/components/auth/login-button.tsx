// libs/ui/src/components/auth/login-button.tsx

'use client';

import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  Alert,
  Avatar,
  Button,
  Divider,
  Stack,
  SvgIcon,
  SvgIconProps,
  TextField,
  Typography,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import PrimitiveModal from '../modal';

// Simple Discord logo as an SVG icon
const DiscordIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M20.317 4.369A19.791 19.791 0 0 0 16.558 3a13.9 13.9 0 0 0-.67 1.384 18.27 18.27 0 0 0-3.776 0A13.818 13.818 0 0 0 11.44 3a19.736 19.736 0 0 0-3.76 1.376C4.46 9.148 3.677 13.864 4.066 18.508a19.9 19.9 0 0 0 4.087 2.092A14.5 14.5 0 0 0 9.74 19.95a12.9 12.9 0 0 1-2.048-.987c.172-.124.338-.255.498-.392a9.5 9.5 0 0 0 8.12 0c.162.138.328.27.498.392-.65.39-1.335.72-2.05.987.37.287.76.547 1.167.78a19.9 19.9 0 0 0 4.087-2.092c.335-3.88-.57-8.557-3.695-14.139ZM9.68 15.508c-.793 0-1.438-.73-1.438-1.625s.64-1.63 1.438-1.63c.802 0 1.447.735 1.438 1.63 0 .895-.64 1.625-1.438 1.625Zm4.64 0c-.793 0-1.438-.73-1.438-1.625s.64-1.63 1.438-1.63c.802 0 1.447.735 1.438 1.63 0 .895-.636 1.625-1.438 1.625Z" />
  </SvgIcon>
);

interface LoginButtonProps {
  /** Optional redirect URL after login/sign-out */
  callbackUrl?: string;
  /** Optional class name for styling */
  className?: string;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  callbackUrl = '/',
  className = '',
}) => {
  const { data: session, status } = useSession();
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSignOut = () => {
    signOut({ callbackUrl });
  };

  const handleOAuth = async (provider: string) => {
    setOpen(false);
    await signIn(provider, { callbackUrl });
  };

  const handleCredentialsLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    setSubmitting(false);

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
      return;
    }

    if (result?.url) {
      window.location.href = result.url;
    } else {
      setOpen(false);
    }
  };

  if (status === 'loading') {
    return (
      <Button
        className={className}
        variant="outlined"
        disabled
        sx={{ opacity: 0.6 }}
      >
        Loading…
      </Button>
    );
  }

  if (session) {
    return (
      <Stack
        className={className}
        direction="row"
        spacing={1}
        alignItems="center"
      >
        <Avatar
          alt={session.user?.name ?? ''}
          src={session.user?.image ?? ''}
          sx={{ width: 32, height: 32 }}
        />
        <Typography variant="body2" color="text.secondary">
          {session.user?.email ?? session.user?.name}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleSignOut}
        >
          Sign out
        </Button>
      </Stack>
    );
  }

  return (
    <>
      <Button
        className={className}
        variant="contained"
        color="primary"
        onClick={handleOpen}
      >
        Log in
      </Button>

      <PrimitiveModal
        open={open}
        onClose={handleClose}
        title="Welcome back"
        description="Choose a sign-in method to continue"
        showCloseButton
      >
        <form onSubmit={handleCredentialsLogin}>
          <Stack spacing={3} sx={{ p: 4, justifyContent: 'center' }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Email / password */}
            <Stack spacing={2}>
              <TextField
                required
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                required
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                type="submit"
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ fontWeight: 600, py: 1.2 }}
                disabled={submitting}
              >
                {submitting ? 'Signing in…' : 'Continue with email'}
              </Button>
            </Stack>

            <Divider>or</Divider>

            {/* OAuth Buttons */}
            <Stack spacing={1.5}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={() => handleOAuth('google')}
                sx={{
                  justifyContent: 'flex-start',
                  gap: 1.5,
                  py: 1.1,
                  px: 2.5,
                }}
              >
                <GoogleIcon fontSize="small" />
                <span>Continue with Google</span>
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={() => handleOAuth('discord')}
                sx={{
                  justifyContent: 'flex-start',
                  gap: 1.5,
                  py: 1.1,
                  px: 2.5,
                }}
              >
                <DiscordIcon fontSize="small" />
                <span>Continue with Discord</span>
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={() => handleOAuth('github')}
                sx={{
                  justifyContent: 'flex-start',
                  gap: 1.5,
                  py: 1.1,
                  px: 2.5,
                }}
              >
                <GitHubIcon fontSize="small" />
                <span>Continue with GitHub</span>
              </Button>
            </Stack>
          </Stack>
        </form>
      </PrimitiveModal>
    </>
  );
};

export default LoginButton;
