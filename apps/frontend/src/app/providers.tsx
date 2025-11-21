// in apps/frontend/src/app/providers.tsx (or similar)
'use client';

import { SessionProvider } from 'next-auth/react';
import { HelixProviders } from '@helix-ai/ui';
import { HypertuneProvider } from '@helix-ai/core/hypertune/hypertune.react';
import type { ReactNode } from 'react';
import type { Mode } from '@helix-ai/ui';

export type AppProvidersProps = {
  children: ReactNode;
  defaultMode?: "system" | Mode;
};

export function AppProviders({ children, defaultMode }: AppProvidersProps) {
  const hypertuneToken = process.env.NEXT_PUBLIC_HYPERTUNE_TOKEN;

  return (
    <HelixProviders defaultMode={defaultMode}>
      <SessionProvider>
        <HypertuneProvider
          createSourceOptions={hypertuneToken ? { token: hypertuneToken } : undefined}
          rootArgs={({ context: { environment: process.env.NODE_ENV } } as any)}
        >
          {children}
        </HypertuneProvider>
      </SessionProvider>
    </HelixProviders>
  );
}
