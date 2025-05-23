'use client'
import { useState, useEffect } from 'react'
import { Box, TextField, Button, Alert, Typography } from '@mui/material'
import { BotColors } from '@/constants/bot'

export default function HeroWaitlist() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'success' | 'error'
  >('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isValidEmail = /^\S+@\S+\.\S+$/.test(email)

  // When we hit ‘success’, schedule it to clear in 5s:
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        setStatus('idle')
      }, 5000)
      return () => clearTimeout(timer)
    } else if (status === 'error') {
      const timer = setTimeout(() => {
        setStatus('idle')
      }, 5000)
      return () => clearTimeout(timer)
    } else if (status === 'sending') {
      const timer = setTimeout(() => {
        setStatus('idle')
      }, 5000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [status])

  const handleSubmit = async () => {
    if (!isValidEmail) return
    setStatus('sending')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const body = await res.json()
      if (body.status === 'success') {
        setStatus('success')
        setEmail('')
      } else {
        throw new Error(body.message || 'Server error')
      }
    } catch (err: any) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4,
        gap: 2,
      }}
    >
      {/* Prompt */}
      <Typography
        variant="h2"
        sx={{
          color: 'rgba(255,255,255,0.85)',
          textAlign: 'center',
          fontSize: { xs: '1.5rem', sm: '2rem' },
          fontWeight: 'bold',
        }}
      >
        Join our waitlist!
      </Typography>

      {/* Feedback */}
      {status === 'success' && (
        <Alert
          severity="success"
          sx={{ mt: 2, width: { xs: '100%', sm: 'auto' } }}
        >
          Thanks! You&apos;re on the waitlist. We will notify you when we
          launch.
        </Alert>
      )}
      {status === 'error' && (
        <Alert
          severity="error"
          sx={{ mt: 2, width: { xs: '100%', sm: 'auto' } }}
        >
          Error: {errorMsg}
        </Alert>
      )}

      {/* Form Row */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextField
          label="Email"
          type="email"
          variant="filled"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={email !== '' && !isValidEmail}
          helperText={
            email !== '' && !isValidEmail ? 'Please enter a valid email' : ''
          }
          sx={{
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: 1,
            input: { color: '#fff' },
            '& .MuiFilledInput-underline:before': {
              borderBottomColor: 'rgba(255,255,255,0.4)',
            },
            '& .MuiFilledInput-underline:hover:before': {
              borderBottomColor: '#fff',
            },
            '& .MuiFilledInput-root': { borderRadius: '4px' },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#fff' },
            flex: { xs: '1 1 auto', sm: '0 0 400px' },
          }}
        />

        {/* Only show button when valid */}
        {isValidEmail && (
          <Button
            type="submit"
            variant="contained"
            disabled={status === 'sending'}
            sx={{
              backgroundColor: BotColors.bot.blue.hex,
              color: '#fff',
              '&:hover': { backgroundColor: BotColors.bot.pink.hex },
              px: 4,
              py: 1.5,
              minWidth: '180px',
            }}
          >
            {status === 'sending' ? 'Sending…' : 'Submit'}
          </Button>
        )}
      </Box>
    </Box>
  )
}
