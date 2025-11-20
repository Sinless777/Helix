'use client';

import React from 'react';
import {
  Alert,
  Button,
  Stack,
  TextField,
  SvgIcon,
  SvgIconProps,
} from '@mui/material';
import Divider from '@mui/material/Divider';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import { signIn } from 'next-auth/react';
import PrimitiveModal from '../modal';

interface SignupButtonProps {
  callbackUrl?: string;
  className?: string;
}

// Simple Discord logo as an SVG icon
const DiscordIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M20.317 4.369A19.791 19.791 0 0 0 16.558 3a13.9 13.9 0 0 0-.67 1.384 18.27 18.27 0 0 0-3.776 0A13.818 13.818 0 0 0 11.44 3a19.736 19.736 0 0 0-3.76 1.376C4.46 9.148 3.677 13.864 4.066 18.508a19.9 19.9 0 0 0 4.087 2.092A14.5 14.5 0 0 0 9.74 19.95a12.9 12.9 0 0 1-2.048-.987c.172-.124.338-.255.498-.392a9.5 9.5 0 0 0 8.12 0c.162.138.328.27.498.392-.65.39-1.335.72-2.05.987.37.287.76.547 1.167.78a19.9 19.9 0 0 0 4.087-2.092c.335-3.88-.57-8.557-3.695-14.139ZM9.68 15.508c-.793 0-1.438-.73-1.438-1.625s.64-1.63 1.438-1.63c.802 0 1.447.735 1.438 1.63 0 .895-.64 1.625-1.438 1.625Zm4.64 0c-.793 0-1.438-.73-1.438-1.625s.64-1.63 1.438-1.63c.802 0 1.447.735 1.438 1.63 0 .895-.636 1.625-1.438 1.625Z" />
  </SvgIcon>
);

export const SignupButton: React.FC<SignupButtonProps> = ({
  callbackUrl = '/',
  className = '',
}) => {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const hashPassword = async (emailValue: string, passwordValue: string) => {
    const data = new TextEncoder().encode(
      `${emailValue.toLowerCase()}:${passwordValue}`,
    );
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleEmailSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const baseUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

    if (!baseUrl) {
      setError('Missing NEXT_PUBLIC_USER_SERVICE_URL configuration.');
      setSubmitting(false);
      return;
    }

    try {
      const hashedPassword = await hashPassword(email, password);

      const res = await fetch(`${baseUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          hashedPassword,
          displayName: displayName || email,
        }),
      });

      if (!res.ok) {
        const msg = (await res.json().catch(() => ({} as any))) as any;
        setError(msg?.message || 'Sign up failed. Please try again.');
        setSubmitting(false);
        return;
      }

      // Auto-sign-in after successful signup for a smoother flow
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created, but automatic sign-in failed. Please log in.');
        setSubmitting(false);
        return;
      }

      if (result?.url) {
        window.location.href = result.url;
      } else {
        setOpen(false);
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error during sign up. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    setOpen(false);
    await signIn(provider, { callbackUrl });
  };

  return (
    <>
      <Button
        className={className}
        variant="outlined"
        color="primary"
        onClick={handleOpen}
      >
        Sign up
      </Button>

      <PrimitiveModal
        open={open}
        onClose={handleClose}
        title="Create an account"
        description="Sign up to get started with Helix AI"
        showCloseButton
      >
        <form onSubmit={handleEmailSignup}>
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
                label="Full name"
                type="text"
                fullWidth
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
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
                {submitting ? 'Creating account…' : 'Sign up'}
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
                <span>Sign up with Google</span>
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
                <span>Sign up with Discord</span>
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
                <span>Sign up with GitHub</span>
              </Button>
            </Stack>
          </Stack>
        </form>
      </PrimitiveModal>
    </>
  );
};

export default SignupButton;
