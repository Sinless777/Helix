// libs/core/src/lib/constants/colors/utils.ts
import type { ColorTriplet, Hex, Rgb, Rgba } from './colors.type'

function normalizeHex(hex: string): Hex {
  const h = hex.startsWith('#') ? hex : `#${hex}`
  const full =
    h.length === 4 ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h
  return full.toLowerCase() as Hex
}

export function hexToRgb(hex: string): Rgb {
  const h = normalizeHex(hex)
  const r = parseInt(h.slice(1, 3), 16)
  const g = parseInt(h.slice(3, 5), 16)
  const b = parseInt(h.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})` as Rgb
}

export function hexToRgba(hex: string, alpha = 1): Rgba {
  const rgb = hexToRgb(hex)
  const [r, g, b] = rgb.match(/\d+/g)!.map(Number)
  return `rgba(${r}, ${g}, ${b}, ${alpha})` as Rgba
}

export function makeColor(hex: string, alpha = 1): ColorTriplet {
  const norm = normalizeHex(hex)
  return {
    hex: norm,
    rgb: hexToRgb(norm),
    rgba: hexToRgba(norm, alpha)
  } as const
}
