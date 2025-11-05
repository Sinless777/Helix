'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Image from 'next/image';

//
// ──────────────────────────────────────────────
//   HERO WAITLIST COMPONENT
// ──────────────────────────────────────────────
//
export function HeroWaitlist() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isValidEmail = /^\S+@\S+\.\S+$/.test(email);

  // Automatically clear feedback after 5 seconds
  useEffect(() => {
    if (status === 'idle') return;
    const timer = setTimeout(() => setStatus('idle'), 5000);
    return () => clearTimeout(timer);
  }, [status]);

  const handleSubmit = async () => {
    if (!isValidEmail || status === 'sending') return;

    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/V1/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);
      if (body?.status !== 'success') throw new Error(body?.message || 'Server error');

      setEmail('');
      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatus('error');
    }
  };

  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4,
        gap: 2,
      }}
    >
      {/* Heading */}
      <Typography
        variant="h2"
        sx={{
          color: 'rgba(255,255,255,0.9)',
          textAlign: 'center',
          fontSize: { xs: '1.5rem', sm: '2rem' },
          fontWeight: 'bold',
        }}
      >
        Join our waitlist!
      </Typography>

      {/* Feedback Alerts */}
      {status === 'success' && (
        <Alert severity="success" sx={{ mt: 2, width: { xs: '100%', sm: 'auto' } }}>
          Thanks! You&apos;re on the waitlist. We’ll notify you when we launch.
        </Alert>
      )}
      {status === 'error' && (
        <Alert severity="error" sx={{ mt: 2, width: { xs: '100%', sm: 'auto' } }}>
          Error: {errorMsg}
        </Alert>
      )}

      {/* Form */}
      <Box
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 600,
        }}
      >
        <TextField
          fullWidth
          label="Email"
          type="email"
          variant="filled"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={email !== '' && !isValidEmail}
          helperText={email !== '' && !isValidEmail ? 'Please enter a valid email' : ' '}
          sx={{
            bgcolor: 'rgba(255,255,255,0.08)',
            borderRadius: 1,
            input: { color: '#fff' },
            '& .MuiFilledInput-underline:before': {
              borderBottomColor: 'rgba(255,255,255,0.3)',
            },
            '& .MuiFilledInput-underline:hover:before': {
              borderBottomColor: '#fff',
            },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#fff' },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={!isValidEmail || status === 'sending'}
          sx={{
            backgroundColor: '#022371',
            color: '#fff',
            '&:hover': { backgroundColor: '#f6066f' },
            px: 4,
            py: 1.5,
            minWidth: '180px',
          }}
        >
          {status === 'sending' ? 'Sending…' : 'Submit'}
        </Button>
      </Box>
    </Box>
  );
}

//
// ──────────────────────────────────────────────
//   HERO SECTION COMPONENT
// ──────────────────────────────────────────────
//
type HeroSectionProps = {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt?: string;
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  imageUrl,
  imageAlt = 'Hero Image',
}) => {
  return (
    <Box
      component="section"
      sx={{
        px: { xs: '1.5rem', md: '4rem' },
        py: { xs: '3rem', md: '5rem' },
        mx: { xs: '1rem', md: '2rem' },
        borderRadius: '0.75rem',
        backgroundColor: 'rgba(30, 30, 30, 0.75)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Grid container spacing={4} alignItems="center">
        {/* Image */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'center' }}>
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={400}
            height={400}
            priority
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '0.5rem' }}
          />
        </Grid>

        {/* Text */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            component="h1"
            sx={{
              fontWeight: 'bold',
              color: '#F6066F',
              fontSize: {
                xs: '1.75rem',
                sm: '2.25rem',
                md: '3rem',
                lg: '4rem',
              },
              fontFamily: '"Pinyon Script", cursive, sans-serif',
              textAlign: { xs: 'center', md: 'left' },
            }}
            gutterBottom
          >
            {title}
          </Typography>
          <Typography
            component="p"
            sx={{
              color: '#6a8db0',
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            {subtitle}
          </Typography>
        </Grid>

        {/* Waitlist */}
        <Grid size={12} sx={{ textAlign: 'center', mt: 4 }}>
          <HeroWaitlist />
        </Grid>
      </Grid>
    </Box>
  );
};
