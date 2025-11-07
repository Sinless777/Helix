// libs/ui/src/providers/theme.provider.tsx
'use client';

import * as React from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { getMuiTheme } from '../theme/mui';
import { applyCssVars } from '../theme/cssVars';
import type { Mode } from '../theme/constants';

type Props = {
  defaultMode?: 'system' | Mode;
  children: React.ReactNode;
};

type Ctx = {
  mode: Mode;
  setMode: (m: Mode) => void;
  toggle: () => void;
};

export const ColorModeContext = React.createContext<Ctx | null>(null);

const getSystem = (): Mode =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

export function ThemeProvider({ defaultMode = 'system', children }: Props) {
  const initial: Mode =
    defaultMode === 'system'
      ? (typeof document !== 'undefined' &&
          (document.documentElement.dataset.theme as Mode)) ||
        getSystem()
      : defaultMode;

  const [mode, setMode] = React.useState<Mode>(initial);

  // Tailwind (class strategy) + data-theme for SSR hydration friendliness
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.dataset.theme = mode;
    applyCssVars(mode);
  }, [mode]);

  // sync system changes if defaultMode === 'system'
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setMode(mq.matches ? 'dark' : 'light');
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, [defaultMode]);

  const ctx: Ctx = {
    mode,
    setMode,
    toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
  };

  const muiTheme = React.useMemo(() => getMuiTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={ctx}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useHelixColorMode() {
  const ctx = React.useContext(ColorModeContext);
  if (!ctx) throw new Error('useHelixColorMode must be used within HelixThemeProvider');
  return ctx;
}
