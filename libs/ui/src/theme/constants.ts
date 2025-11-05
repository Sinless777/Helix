// libs/ui/src/theme/constants.ts

export type ColorFormats = {
  hex: string;
  rgb: string;
  rgba: string;
};

export type ThemePalette = {
  primary: ColorFormats;
  primaryForeground: ColorFormats;
  background: ColorFormats;
  backgroundTransparent: ColorFormats;
  surface: ColorFormats;
  surfaceTransparent: ColorFormats;
  border: ColorFormats;
  text: ColorFormats;
  textSecondary: ColorFormats;
  accent: ColorFormats;
  accentForeground: ColorFormats;
};

const normalizeHex = (hex: string): string => {
  const stripped = hex.replace('#', '').trim();
  if (stripped.length === 3) {
    return stripped.split('').map((c) => c + c).join('').toUpperCase();
  }
  if (stripped.length !== 6) throw new Error(`Invalid hex color: "${hex}"`);
  return stripped.toUpperCase();
};

const hexToRgb = (hex: string): [number, number, number] => {
  const n = Number.parseInt(normalizeHex(hex), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const alphaToHex = (alpha: number): string =>
  Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

const createColor = (hex: string, alpha = 1): ColorFormats => {
  const [r, g, b] = hexToRgb(hex);
  const base = `#${normalizeHex(hex)}`;
  return {
    hex: alpha >= 1 ? base : `${base}${alphaToHex(alpha)}`,
    rgb: `rgb(${r}, ${g}, ${b})`,
    rgba: `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(3))})`,
  };
};

export const lightTheme: ThemePalette = {
  primary: createColor('#6200EE'),
  primaryForeground: createColor('#FFFFFF'),
  background: createColor('#F5F7FC'),
  backgroundTransparent: createColor('#F5F7FC', 0.72),
  surface: createColor('#FFFFFF'),
  surfaceTransparent: createColor('#FFFFFF', 0.78),
  border: createColor('#D6DBE6'),
  text: createColor('#121826'),
  textSecondary: createColor('#5C6982'),
  accent: createColor('#00BCD4'),
  accentForeground: createColor('#082B38'),
};

export const darkTheme: ThemePalette = {
  primary: createColor('#8C52FF'),
  primaryForeground: createColor('#130D29'),
  background: createColor('#070A11'),
  backgroundTransparent: createColor('#070A11', 0.72),
  surface: createColor('#181A22'),
  surfaceTransparent: createColor('#181A22', 0.7),
  border: createColor('#383D4F'),
  text: createColor('#E5E8F0'),
  textSecondary: createColor('#A4AABE'),
  accent: createColor('#00BFA6'),
  accentForeground: createColor('#052421'),
};

export const themes = { light: lightTheme, dark: darkTheme } as const;
export type ThemeMode = keyof typeof themes;
export type Mode = ThemeMode;

export const HELIX_COLORS = {
  light: {
    primary: lightTheme.primary.hex,
    secondary: lightTheme.accent.hex,
    background: lightTheme.background.hex,
    surface: lightTheme.surface.hex,
    textPrimary: lightTheme.text.hex,
    textSecondary: lightTheme.textSecondary.hex,
  },
  dark: {
    primary: darkTheme.primary.hex,
    secondary: darkTheme.accent.hex,
    background: darkTheme.background.hex,
    surface: darkTheme.surface.hex,
    textPrimary: darkTheme.text.hex,
    textSecondary: darkTheme.textSecondary.hex,
  },
} as const;

export const HelixFonts = {
  LORA: 'var(--font-lora, "Lora", serif)',
  PINYON: 'var(--font-pinyon, "Pinyon Script", cursive)',
  INTER: 'var(--font-inter, "Inter", sans-serif)',
} as const;
