// libs/core/src/lib/constants/frontend/system/index.ts

/** Terminal color representation across formats */
export interface ColorCode {
  /** ANSI escape sequence for console output */
  ansi: string
  /** Hexadecimal color string (#RRGGBB) */
  hex: string
  /** CSS rgb() string */
  rgb: string
  /** CSS rgba() string */
  rgba: string
}

/** Foreground & background color maps */
export interface ColorMap {
  black: ColorCode
  red: ColorCode
  green: ColorCode
  yellow: ColorCode
  blue: ColorCode
  magenta: ColorCode
  cyan: ColorCode
  white: ColorCode
  gray: ColorCode
  crimson: ColorCode
}

/** System color codes for console + UI consistency */
export const SystemColors: {
  reset: string
  bright: string
  dim: string
  underscore: string
  blink: string
  reverse: string
  hidden: string
  fg: ColorMap
  bg: ColorMap
} = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  fg: {
    black: {
      ansi: '\x1b[30m',
      hex: '#000000',
      rgb: 'rgb(0,0,0)',
      rgba: 'rgba(0,0,0,1)'
    },
    red: {
      ansi: '\x1b[31m',
      hex: '#FF0000',
      rgb: 'rgb(255,0,0)',
      rgba: 'rgba(255,0,0,1)'
    },
    green: {
      ansi: '\x1b[32m',
      hex: '#00FF00',
      rgb: 'rgb(0,255,0)',
      rgba: 'rgba(0,255,0,1)'
    },
    yellow: {
      ansi: '\x1b[33m',
      hex: '#FFFF00',
      rgb: 'rgb(255,255,0)',
      rgba: 'rgba(255,255,0,1)'
    },
    blue: {
      ansi: '\x1b[34m',
      hex: '#0000FF',
      rgb: 'rgb(0,0,255)',
      rgba: 'rgba(0,0,255,1)'
    },
    magenta: {
      ansi: '\x1b[35m',
      hex: '#FF00FF',
      rgb: 'rgb(255,0,255)',
      rgba: 'rgba(255,0,255,1)'
    },
    cyan: {
      ansi: '\x1b[36m',
      hex: '#00FFFF',
      rgb: 'rgb(0,255,255)',
      rgba: 'rgba(0,255,255,1)'
    },
    white: {
      ansi: '\x1b[37m',
      hex: '#FFFFFF',
      rgb: 'rgb(255,255,255)',
      rgba: 'rgba(255,255,255,1)'
    },
    gray: {
      ansi: '\x1b[90m',
      hex: '#808080',
      rgb: 'rgb(128,128,128)',
      rgba: 'rgba(128,128,128,1)'
    },
    crimson: {
      ansi: '\x1b[38;5;197m',
      hex: '#DC143C',
      rgb: 'rgb(220,20,60)',
      rgba: 'rgba(220,20,60,1)'
    }
  },

  bg: {
    black: {
      ansi: '\x1b[40m',
      hex: '#000000',
      rgb: 'rgb(0,0,0)',
      rgba: 'rgba(0,0,0,1)'
    },
    red: {
      ansi: '\x1b[41m',
      hex: '#FF0000',
      rgb: 'rgb(255,0,0)',
      rgba: 'rgba(255,0,0,1)'
    },
    green: {
      ansi: '\x1b[42m',
      hex: '#00FF00',
      rgb: 'rgb(0,255,0)',
      rgba: 'rgba(0,255,0,1)'
    },
    yellow: {
      ansi: '\x1b[43m',
      hex: '#FFFF00',
      rgb: 'rgb(255,255,0)',
      rgba: 'rgba(255,255,0,1)'
    },
    blue: {
      ansi: '\x1b[44m',
      hex: '#0000FF',
      rgb: 'rgb(0,0,255)',
      rgba: 'rgba(0,0,255,1)'
    },
    magenta: {
      ansi: '\x1b[45m',
      hex: '#FF00FF',
      rgb: 'rgb(255,0,255)',
      rgba: 'rgba(255,0,255,1)'
    },
    cyan: {
      ansi: '\x1b[46m',
      hex: '#00FFFF',
      rgb: 'rgb(0,255,255)',
      rgba: 'rgba(0,255,255,1)'
    },
    white: {
      ansi: '\x1b[47m',
      hex: '#FFFFFF',
      rgb: 'rgb(255,255,255)',
      rgba: 'rgba(255,255,255,1)'
    },
    gray: {
      ansi: '\x1b[100m',
      hex: '#808080',
      rgb: 'rgb(128,128,128)',
      rgba: 'rgba(128,128,128,1)'
    },
    crimson: {
      ansi: '\x1b[48;5;197m',
      hex: '#DC143C',
      rgb: 'rgb(220,20,60)',
      rgba: 'rgba(220,20,60,1)'
    }
  }
} as const
