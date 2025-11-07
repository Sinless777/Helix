import { ThemeProvider } from './theme.provider';
import type { Mode } from '../theme/constants';
import FaroProvider from './faro.provider';


export type HelixProvidersProps = {
  /** 'system' uses prefers-color-scheme; otherwise force light/dark */
  defaultMode?: 'system' | Mode;
  children: any;
};


export function HelixProviders({ children, defaultMode }: HelixProvidersProps) {

  return (
    <ThemeProvider defaultMode={defaultMode}>
      <FaroProvider>
        {children}
      </FaroProvider>
    </ThemeProvider>
  );
}