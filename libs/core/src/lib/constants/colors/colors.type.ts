// libs/core/src/lib/constants/colors/colors.type.ts

// Strict hex/rgb/rgba string types (helps catch typos at compile time)
export type Hex = `#${string}`
export type Rgb = `rgb(${number}, ${number}, ${number})`
export type Rgba =
  `rgba(${number}, ${number}, ${number}, ${number | `${number}`})`

export type ColorTriplet = Readonly<{
  hex: Hex
  rgb: Rgb
  rgba: Rgba
}>

export type AnsiColor = Readonly<{
  ansi: `\x1b[${number}m`
  hex: Hex
  rgb: Rgb
  rgba: Rgba
}>

export type AnsiTable = Readonly<{
  [k in
    | 'black'
    | 'red'
    | 'green'
    | 'yellow'
    | 'blue'
    | 'magenta'
    | 'cyan'
    | 'white'
    | 'gray'
    | 'crimson']: AnsiColor
}>

export type SystemAnsi = Readonly<{
  reset: `\x1b[0m`
  bright: `\x1b[1m`
  dim: `\x1b[2m`
  underscore: `\x1b[4m`
  blink: `\x1b[5m`
  reverse: `\x1b[7m`
  hidden: `\x1b[8m`
  fg: AnsiTable
  bg: AnsiTable
}>

export type BotColors = Readonly<{
  bot: {
    blue: ColorTriplet
    pink: ColorTriplet
  }
  company: {
    gold: ColorTriplet
    silver: ColorTriplet
    black: ColorTriplet
  }
  system: {
    critical: ColorTriplet
    error: ColorTriplet
    warning: ColorTriplet
    info: ColorTriplet
    success: ColorTriplet
  }
}>

// For your app theme (primary/secondary/etc)
export type ThemeColorSet = Readonly<{
  primary: ColorTriplet
  secondary: ColorTriplet
  tertiary: ColorTriplet
  success: ColorTriplet
  error: ColorTriplet
  warning: ColorTriplet
  info: ColorTriplet
}>
