// user-interfaces/frontend/src/constants/themes/main.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
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
});

export default theme;
