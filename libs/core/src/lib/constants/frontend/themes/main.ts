// user-interfaces/frontend/src/constants/themes/main.ts
import { createTheme } from '@mui/material/styles'
const theme = createTheme({
  palette: {
    mode: 'dark',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#f6066f',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#f6066f',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#f6066f',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#f6066f',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.6,
      color: '#f6066f',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.7,
      color: '#f6066f',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          padding: '1.5rem',
          backgroundColor: 'rgba(10, 10, 15, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          boxShadow:
            '0 0 10px rgba(246, 6, 111, 0.1), inset 0 0 10px rgba(246, 6, 111, 0.05)',
          WebkitBackdropFilter: 'blur(10px)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease-in-out',
          height: '100%',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          '& .cardTitle': {
            color: '#f6066f',
            fontWeight: 600,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          },
          '& .icon': {
            fontSize: '1.4rem',
          },
          '& .cardContent': {
            color: '#dddddd',
            fontSize: '1rem',
            lineHeight: 1.75,
            letterSpacing: '0.02em',
          },
        },
      },
    },
  },
})

export default theme
