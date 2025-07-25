// user-interfaces/frontend/src/constants/themes/docs.ts

import { createTheme } from '@mui/material/styles'

const docsTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  palette: {
    mode: 'dark',
    background: {
      default: '#0e0f1c',
      paper: '#121326',
    },
    text: {
      primary: '#FAFAFA',
      secondary: '#CCCCCC',
    },
    primary: {
      main: '#66CCFF',
    },
    secondary: {
      main: '#88CCFF',
    },
    divider: '#333333',
  },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    fontSize: 14,
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      color: '#FFFFFF',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#66CCFF',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#FFFFFF',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      color: '#88CCFF',
    },
    body1: {
      fontSize: '1rem',
      color: '#CCCCCC',
      lineHeight: 1.75,
    },
  },
  spacing: 8,
  components: {
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#333333',
        },
      },
    },
  },
})

export default docsTheme
