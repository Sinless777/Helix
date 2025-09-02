// libs/core/src/lib/constants/colors/colors.ts

import { makeColor } from './utils'
import type {
  SystemAnsi,
  BotColors as BotColorsType,
  ThemeColorSet
} from './colors.type'

/**
 * @name HelixColors
 * Canonical app palette for UI frameworks (MUI/Tailwind/etc).
 */
export const HelixColors: ThemeColorSet = {
  primary: makeColor('#F7068D'),
  secondary: makeColor('#1540D1'),
  tertiary: makeColor('#3D3D3D'),
  success: makeColor('#28a745'),
  error: makeColor('#FF4C4C'),
  warning: makeColor('#FFA500'),
  info: makeColor('#1E90FF')
} as const

/**
 * System ANSI table for console output (Nest/Next shared logger).
 */
export const SystemColors: SystemAnsi = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  fg: {
    black: { ansi: '\x1b[30m', ...makeColor('#000000') },
    red: { ansi: '\x1b[31m', ...makeColor('#FF0000') },
    green: { ansi: '\x1b[32m', ...makeColor('#00FF00') },
    yellow: { ansi: '\x1b[33m', ...makeColor('#FFFF00') },
    blue: { ansi: '\x1b[34m', ...makeColor('#0000FF') },
    magenta: { ansi: '\x1b[35m', ...makeColor('#FF00FF') },
    cyan: { ansi: '\x1b[36m', ...makeColor('#00FFFF') },
    white: { ansi: '\x1b[37m', ...makeColor('#FFFFFF') },
    gray: { ansi: '\x1b[90m', ...makeColor('#808080') },
    crimson: { ansi: '\x1b[38m', ...makeColor('#DC143C') }
  },
  bg: {
    black: { ansi: '\x1b[40m', ...makeColor('#000000') },
    red: { ansi: '\x1b[41m', ...makeColor('#FF0000') },
    green: { ansi: '\x1b[42m', ...makeColor('#00FF00') },
    yellow: { ansi: '\x1b[43m', ...makeColor('#FFFF00') },
    blue: { ansi: '\x1b[44m', ...makeColor('#0000FF') },
    magenta: { ansi: '\x1b[45m', ...makeColor('#FF00FF') },
    cyan: { ansi: '\x1b[46m', ...makeColor('#00FFFF') },
    white: { ansi: '\x1b[47m', ...makeColor('#FFFFFF') },
    gray: { ansi: '\x1b[100m', ...makeColor('#808080') },
    crimson: { ansi: '\x1b[48m', ...makeColor('#DC143C') }
  }
} as const

/**
 * Brand + semantic system colors for bot/company/system messages.
 */
export const BotColors: BotColorsType = {
  bot: {
    blue: makeColor('#022371'),
    pink: makeColor('#f6066f')
  },
  company: {
    gold: makeColor('#daa520'),
    silver: makeColor('#d1cfd0'),
    black: makeColor('#000000')
  },
  system: {
    critical: makeColor('#FF0000'),
    error: makeColor('#EE4B2B'),
    warning: makeColor('#FFEA00'),
    info: makeColor('#0000FF'),
    success: makeColor('#00ff00')
  }
} as const
