// libs/ui/src/theme/cssVars.ts
import { HELIX_COLORS, type Mode } from './constants';

const VARS: Record<string, (mode: Mode) => string> = {
  '--hx-bg': (m) => HELIX_COLORS[m].background,
  '--hx-surface': (m) => HELIX_COLORS[m].surface,
  '--hx-text': (m) => HELIX_COLORS[m].textPrimary,
  '--hx-text-2': (m) => HELIX_COLORS[m].textSecondary,
  '--hx-primary': (m) => HELIX_COLORS[m].primary,
  '--hx-secondary': (m) => HELIX_COLORS[m].secondary,
};

export function applyCssVars(mode: Mode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const [k, fn] of Object.entries(VARS)) {
    root.style.setProperty(k, fn(mode));
  }
  // helpful translucent bases
  root.style.setProperty('--hx-glass-bg', 'rgba(255,255,255,0.08)');
  root.style.setProperty('--hx-glass-brd', 'rgba(255,255,255,0.12)');
  root.style.setProperty('--hx-shadow', '0 10px 30px rgba(0,0,0,0.25)');
}
