/**
 * @name HelixColors
 *
 * @description This object contains the primary, secondary, tertiary, success, error, warning, and info colors used in the application.
 *
 * @property primary - The primary color of the application.
 * @property secondary - The secondary color of the application.
 * @property tertiary - The tertiary color of the application.
 * @property success - The success color of the application.
 * @property error - The error color of the application.
 * @property warning - The warning color of the application.
 * @property info - The info color of the application.
 */
export const HelixColors = {
  primary: {
    hex: '#F7068D',
    rgb: 'rgb(247,6,141)',
  },
  secondary: {
    hex: '#1540D1',
    rgb: 'rgb(21,64,209)',
  },
  tertiary: {
    hex: '#3D3D3D',
    rgb: 'rgb(61,61,61)',
  },
  success: {
    hex: '#28a745',
    rgb: 'rgb(40,167,69)',
  },
  error: {
    hex: '#FF4C4C',
    rgb: 'rgb(255,76,76)',
  },
  warning: {
    hex: '#FFA500',
    rgb: 'rgb(255,165,0)',
  },
  info: {
    hex: '#1E90FF',
    rgb: 'rgb(30,144,255)',
  },
}

import { botColors } from './colors.type'

export const SystemColors = {
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
      rgb: 'rgb(0, 0, 0)',
      rgba: 'rgba(0, 0, 0, 1)',
    },
    red: {
      ansi: '\x1b[31m',
      hex: '#FF0000',
      rgb: 'rgb(255, 0, 0)',
      rgba: 'rgba(255, 0, 0, 1)',
    },
    green: {
      ansi: '\x1b[32m',
      hex: '#00FF00',
      rgb: 'rgb(0, 255, 0)',
      rgba: 'rgba(0, 255, 0, 1)',
    },
    yellow: {
      ansi: '\x1b[33m',
      hex: '#FFFF00',
      rgb: 'rgb(255, 255, 0)',
      rgba: 'rgba(255, 255, 0, 1)',
    },
    blue: {
      ansi: '\x1b[34m',
      hex: '#0000FF',
      rgb: 'rgb(0, 0, 255)',
      rgba: 'rgba(0, 0, 255, 1)',
    },
    magenta: {
      ansi: '\x1b[35m',
      hex: '#FF00FF',
      rgb: 'rgb(255, 0, 255)',
      rgba: 'rgba(255, 0, 255, 1)',
    },
    cyan: {
      ansi: '\x1b[36m',
      hex: '#00FFFF',
      rgb: 'rgb(0, 255, 255)',
      rgba: 'rgba(0, 255, 255, 1)',
    },
    white: {
      ansi: '\x1b[37m',
      hex: '#FFFFFF',
      rgb: 'rgb(255, 255, 255)',
      rgba: 'rgba(255, 255, 255, 1)',
    },
    gray: {
      ansi: '\x1b[90m',
      hex: '#808080',
      rgb: 'rgb(128, 128, 128)',
      rgba: 'rgba(128, 128, 128, 1)',
    },
    crimson: {
      ansi: '\x1b[38m',
      hex: '#DC143C',
      rgb: 'rgb(220, 20, 60)',
      rgba: 'rgba(220, 20, 60, 1)',
    },
  },
  bg: {
    black: {
      ansi: '\x1b[40m',
      hex: '#000000',
      rgb: 'rgb(0, 0, 0)',
      rgba: 'rgba(0, 0, 0, 1)',
    },
    red: {
      ansi: '\x1b[41m',
      hex: '#FF0000',
      rgb: 'rgb(255, 0, 0)',
      rgba: 'rgba(255, 0, 0, 1)',
    },
    green: {
      ansi: '\x1b[42m',
      hex: '#00FF00',
      rgb: 'rgb(0, 255, 0)',
      rgba: 'rgba(0, 255, 0, 1)',
    },
    yellow: {
      ansi: '\x1b[43m',
      hex: '#FFFF00',
      rgb: 'rgb(255, 255, 0)',
      rgba: 'rgba(255, 255, 0, 1)',
    },
    blue: {
      ansi: '\x1b[44m',
      hex: '#0000FF',
      rgb: 'rgb(0, 0, 255)',
      rgba: 'rgba(0, 0, 255, 1)',
    },
    magenta: {
      ansi: '\x1b[45m',
      hex: '#FF00FF',
      rgb: 'rgb(255, 0, 255)',
      rgba: 'rgba(255, 0, 255, 1)',
    },
    cyan: {
      ansi: '\x1b[46m',
      hex: '#00FFFF',
      rgb: 'rgb(0, 255, 255)',
      rgba: 'rgba(0, 255, 255, 1)',
    },
    white: {
      ansi: '\x1b[47m',
      hex: '#FFFFFF',
      rgb: 'rgb(255, 255, 255)',
      rgba: 'rgba(255, 255, 255, 1)',
    },
    gray: {
      ansi: '\x1b[100m',
      hex: '#808080',
      rgb: 'rgb(128, 128, 128)',
      rgba: 'rgba(128, 128, 128, 1)',
    },
    crimson: {
      ansi: '\x1b[48m',
      hex: '#DC143C',
      rgb: 'rgb(220, 20, 60)',
      rgba: 'rgba(220, 20, 60, 1)',
    },
  },
}

export const BotColors: botColors = {
  bot: {
    blue: { hex: '#022371', rgb: 'rgb(2, 35, 113)' },
    pink: { hex: '#f6066f', rgb: 'rgb(246, 6, 111)' },
  },
  company: {
    gold: { hex: '#daa520', rgb: 'rgb(218, 165, 32)' },
    silver: { hex: '#d1cfd0', rgb: 'rgb(209, 207, 208)' },
    black: { hex: '#000000', rgb: 'rgb(0, 0, 0)' },
  },
  system: {
    critical: { hex: '#FF0000', rgb: 'rgb(255, 0, 0)' },
    error: { hex: '#EE4B2B', rgb: 'rgb(238, 75, 43)' },
    warning: { hex: '#FFEA00', rgb: 'rgb(255, 234, 0)' },
    info: { hex: '#0000FF', rgb: 'rgb(0, 0, 255)' },
    success: { hex: '#00ff00', rgb: 'rgb(0, 255, 0)' },
  },
}
