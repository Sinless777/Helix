// libs/core/src/lib/constants/frontend/themes/docs.ts

import { createTheme } from '@mui/material/styles'

const docsTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class'
  },
  palette: {
    mode: 'dark',
    background: {
      default: '#0e0f1c',
      paper: '#121326'
    },
    text: {
      primary: '#FAFAFA',
      secondary: '#CCCCCC'
    },
    primary: {
      main: '#66CCFF',
      contrastText: '#0e0f1c' // better contrast handling
    },
    secondary: {
      main: '#88CCFF',
      contrastText: '#0e0f1c'
    },
    divider: '#333333'
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(
      ', '
    ),
    fontSize: 14,
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      color: '#FFFFFF'
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#66CCFF'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#FFFFFF'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      color: '#88CCFF'
    },
    body1: {
      fontSize: '1rem',
      color: '#CCCCCC',
      lineHeight: 1.75
    },
    body2: {
      fontSize: '0.875rem',
      color: '#AAAAAA', // extra text style for captions / meta info
      lineHeight: 1.6
    }
  },
  spacing: 8,
  components: {
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#333333'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600
        }
      }
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#66CCFF',
          '&:hover': {
            color: '#88CCFF',
            textDecoration: 'underline'
          }
        }
      }
    }
  }
})

export default docsTheme
