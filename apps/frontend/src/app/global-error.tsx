// app/global-error.tsx
'use client';

import type { CSSProperties } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const rootStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#050505',
  color: '#f5f5f5',
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  padding: '2rem',
};

const cardStyle: CSSProperties = {
  maxWidth: '480px',
  width: '100%',
  padding: '2.5rem',
  borderRadius: '1.25rem',
  background: 'rgba(15, 15, 20, 0.92)',
  boxShadow: '0 40px 80px rgba(0, 0, 0, 0.35)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const titleStyle: CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 600,
  letterSpacing: '-0.02em',
};

const bodyStyle: CSSProperties = {
  opacity: 0.72,
  lineHeight: 1.6,
  fontSize: '0.95rem',
};

const buttonStyle: CSSProperties = {
  alignSelf: 'flex-start',
  borderRadius: '999px',
  padding: '0.65rem 1.5rem',
  fontWeight: 600,
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  color: '#f5f5f5',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 18px 40px rgba(99, 102, 241, 0.35)',
  transition: 'transform 120ms ease, box-shadow 180ms ease',
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const message =
    process.env.NODE_ENV !== 'production'
      ? error?.message || 'Unknown error'
      : 'An unexpected error occurred.';

  return (
    <html lang="en">
      <body style={rootStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Something went wrong</h1>
          <p style={bodyStyle}>{message}</p>
          {error?.digest && (
            <code style={{ ...bodyStyle, fontSize: '0.8rem' }}>Error ID: {error.digest}</code>
          )}
          <button type="button" style={buttonStyle} onClick={() => reset()}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
