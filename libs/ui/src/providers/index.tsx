'use client';

import React, { ReactNode } from 'react';
import { ThemeProvider } from './theme.provider';
import FaroProvider from './faro.provider';
import HypertuneProvider from './hypertune.provider';
import type { Mode } from '../theme/constants';

export type HelixProvidersProps = {
  /** 'system' uses prefers-color-scheme; otherwise force light/dark */
  defaultMode?: 'system' | Mode;
  /** Toggle Faro instrumentation */
  enableFaro?: boolean;
  /** Toggle Hypertune flags/context */
  enableHypertune?: boolean;
  children: ReactNode;
};

/**
 * HelixProviders — wraps Theme + optional Faro + optional Hypertune.
 * Order: Theme → Faro → Hypertune so consumers can read flags/computed values.
 */
export const HelixProviders: React.FC<HelixProvidersProps> = ({
  children,
  defaultMode = 'system',
  enableFaro = true,
  enableHypertune = true,
}) => {
  let tree = <ThemeProvider defaultMode={defaultMode}>{children}</ThemeProvider>;

  if (enableFaro) {
    tree = <FaroProvider>{tree}</FaroProvider>;
  }

  if (enableHypertune) {
    tree = <HypertuneProvider>{tree}</HypertuneProvider>;
  }

  return tree;
};

// Re-exports for finer-grained composition if needed
export { ThemeProvider, FaroProvider, HypertuneProvider };
