// libs/ui/src/theme/mui.ts
import { createTheme, type ThemeOptions } from '@mui/material/styles';
import { HELIX_COLORS, HelixFonts, type Mode } from './constants';

export function getMuiTheme(mode: Mode) {
  const c = HELIX_COLORS[mode];

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: { main: c.primary },
      secondary: { main: c.secondary },
      background: { default: c.background, paper: c.surface },
      text: { primary: c.textPrimary, secondary: c.textSecondary },
    },
    typography: {
      fontFamily: HelixFonts.LORA,
      h1: { fontFamily: HelixFonts.PINYON, fontWeight: 600 },
      h2: { fontFamily: HelixFonts.PINYON, fontWeight: 600 },
      h3: { fontFamily: HelixFonts.LORA, fontWeight: 600 },
      h4: { fontFamily: HelixFonts.LORA, fontWeight: 600 },
      h5: { fontFamily: HelixFonts.LORA, fontWeight: 600 },
      h6: { fontFamily: HelixFonts.LORA, fontWeight: 600 },
      subtitle1: { fontFamily: HelixFonts.LORA },
      subtitle2: { fontFamily: HelixFonts.LORA },
      body1: { fontFamily: HelixFonts.LORA },
      body2: { fontFamily: HelixFonts.LORA },
      button: {
        fontFamily: HelixFonts.LORA,
        textTransform: 'uppercase',
        fontWeight: 600,
        letterSpacing: '0.05em',
      },
      overline: { fontFamily: HelixFonts.LORA, letterSpacing: '0.08em' },
      caption: { fontFamily: HelixFonts.LORA },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'all 0.2s ease',
            '&:hover': { boxShadow: `0 0 12px ${c.primary}80` },
          },
          containedPrimary: {
            backgroundColor: c.primary,
            color: '#fff',
            '&:hover': { backgroundColor: c.secondary },
          },
          outlinedPrimary: {
            color: c.primary,
            borderColor: c.primary,
            '&:hover': { borderColor: c.secondary, color: c.secondary },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
}
