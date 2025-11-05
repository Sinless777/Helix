// libs/ui/src/theme/glass.ts
import { alpha } from '@mui/material/styles';

export const glass = (bg: string) => ({
  backdropFilter: 'saturate(160%) blur(12px)',
  background: alpha(bg, 0.6),
  border: '1px solid var(--hx-glass-brd)',
  boxShadow: 'var(--hx-shadow)',
  borderRadius: 16,
});

export const glassOnPaper = {
  backdropFilter: 'saturate(160%) blur(10px)',
  background: 'var(--hx-glass-bg)',
  border: '1px solid var(--hx-glass-brd)',
  boxShadow: 'var(--hx-shadow)',
  borderRadius: 16,
};
