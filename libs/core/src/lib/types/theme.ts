// libs/core/src/lib/types/theme.ts

/* -----------------------------------------------------------------------------
 * Helix UI Theme Types (framework-agnostic)
 * -----------------------------------------------------------------------------
 * - No runtime code; types only.
 * - Designed to mirror common design-system primitives while staying independent
 *   of any specific UI library (e.g., MUI, Chakra, Tailwind).
 * - Works with your existing DocsTheme/MainTheme objects.
 * ---------------------------------------------------------------------------*/

export type ThemeMode = 'light' | 'dark' | 'system'

/** Minimal style object to avoid depending on React types here. */
export type CSSProperties = Record<string, string | number>

/** Deep partial utility for ergonomic theme authoring. */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Array<infer A>
      ? Array<DeepPartial<A>>
      : DeepPartial<T[K]>
    : T[K]
}

/** Exact utility (useful when you want to prevent excess keys). */
export type Exact<T, Shape extends T> = T & {
  [K in Exclude<keyof Shape, keyof T>]?: never
}

/* --------------------------------- Palette -------------------------------- */

export interface PaletteColor {
  /** Primary shade (e.g., #66CCFF) */
  main: string
  /** Optional supporting shades */
  light?: string
  dark?: string
  contrastText?: string
}

export interface BackgroundPalette {
  /** App/page background (canvas) */
  default: string
  /** Card/paper surface */
  paper: string
}

export interface TextPalette {
  primary: string
  secondary?: string
  disabled?: string
  hint?: string
}

export interface Palette {
  /** Light/Dark toggle (optional if you prefer single palette) */
  mode?: ThemeMode

  primary: PaletteColor
  secondary?: PaletteColor

  /** Extended semantic colors */
  success?: PaletteColor
  warning?: PaletteColor
  error?: PaletteColor
  info?: PaletteColor

  background: BackgroundPalette
  text: TextPalette

  /** Separator color for borders/dividers */
  divider?: string

  /** Custom tokens bucket if you need more */
  custom?: Record<string, string>
}

/* ------------------------------- Typography ------------------------------- */

export interface FontVariant {
  fontFamily?: string
  fontSize?: number | string
  fontWeight?: number | string
  lineHeight?: number | string
  letterSpacing?: number | string
  color?: string
  /** Any ad-hoc CSS tokens (e.g., textTransform) */
  [cssProp: string]: unknown
}

export interface TypographyScale {
  /** Global defaults */
  fontFamily?: string
  fontSize?: number // base px size (e.g., 14)
  htmlFontSize?: number // root <html> font-size for rem math

  h1?: FontVariant
  h2?: FontVariant
  h3?: FontVariant
  h4?: FontVariant
  h5?: FontVariant
  h6?: FontVariant

  subtitle1?: FontVariant
  subtitle2?: FontVariant

  body1?: FontVariant
  body2?: FontVariant

  button?: FontVariant
  caption?: FontVariant
  overline?: FontVariant
}

/* --------------------------------- Layout --------------------------------- */

export interface Shape {
  /** Base border radius (px) */
  borderRadius?: number
  /** Optional detailed radii */
  radius?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
    full?: number
  }
}

export interface ZIndex {
  appBar?: number
  drawer?: number
  modal?: number
  snackbar?: number
  tooltip?: number
  /** Extensions */
  [layer: string]: number | undefined
}

/** Common shadow tokens; string values are CSS box-shadow declarations. */
export type Elevation = string
export type Shadows = [
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation,
  Elevation
]

/** Spacing can be:
 *   - a number (base unit, e.g., 8)
 *   - or a function that maps a factor to CSS length (px/rem/etc.)
 */
export type Spacing = number | ((factor: number) => number | string)

/* --------------------------- Component Overrides -------------------------- */

export interface ComponentStyleOverrides {
  /** CSS overrides for the root element of a component */
  root?: CSSProperties
  /** Named slot overrides (keys are arbitrary, e.g., 'content', 'title') */
  [slot: string]: CSSProperties | undefined
}

/** Registry keyed by a component name (framework-specific naming is fine). */
export type ComponentsOverrides = Record<
  string,
  {
    styleOverrides?: ComponentStyleOverrides
    /** Optional variant tokens (e.g., size="sm", color="primary") */
    variants?: Array<Record<string, unknown>>
    /** Optional default props (e.g., disableRipple: true) */
    defaultProps?: Record<string, unknown>
  }
>

/* ------------------------------ CSS Variables ----------------------------- */

export interface CSSVariablesConfig {
  /** Strategy for color-scheme toggling (class/data-attr/etc.) */
  colorSchemeSelector?: 'class' | 'data-attribute'
  /** Root selector to attach variables (e.g., ':root', 'html', 'body') */
  rootSelector?: string
  /** Custom variable bucket */
  tokens?: Record<string, string | number>
}

/* --------------------------------- Theme ---------------------------------- */

export interface UITheme {
  /** Optional CSS variable strategy/tokens */
  cssVariables?: CSSVariablesConfig

  /** Colors */
  palette: Palette

  /** Typography scale */
  typography?: TypographyScale

  /** Spacing scale or function (default often 8) */
  spacing?: Spacing

  /** Shape tokens (border radii, etc.) */
  shape?: Shape

  /** Elevation scale (25 entries by convention) */
  shadows?: Shadows

  /** Layering (z-index) tokens */
  zIndex?: ZIndex

  /** Per-component style overrides and default props */
  components?: ComponentsOverrides

  /** Arbitrary extensions for app-specific tokens */
  custom?: Record<string, unknown>
}

/** Authoring helper that allows partial nested shapes. */
export type UIThemeOptions = DeepPartial<UITheme>

/** Type guard to check an unknown value looks like a UITheme (best-effort). */
export function isUITheme(x: unknown): x is UITheme {
  if (!x || typeof x !== 'object') return false
  const t = x as Partial<UITheme>
  return typeof t === 'object' && !!t.palette && typeof t.palette === 'object'
}
