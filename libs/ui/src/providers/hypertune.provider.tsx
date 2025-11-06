// libs/ui/src/providers/hypertune.provider.tsx
"use client";

import * as React from "react";
import { HypertuneSourceProvider, HypertuneHydrator, HypertuneRootProvider }
  from "@helix/hypertune";

interface HypertuneProviderProps {
  createSourceOptions: any;  // adjust types as needed
  dehydratedState?: any | null;
  rootArgs: any;
  children: React.ReactNode;
}

export default function HypertuneProvider({
  createSourceOptions,
  dehydratedState,
  rootArgs,
  children,
}: HypertuneProviderProps) {
  // If you still need the result of getHypertune, call it here or elsewhere:
  // e.g. const root = await getHypertune();

  return (
    <HypertuneSourceProvider createSourceOptions={{
        ...createSourceOptions,
        ...(dehydratedState ?? {}),
      }}
    >
      <HypertuneHydrator dehydratedState={dehydratedState}>
        <HypertuneRootProvider rootArgs={rootArgs}>
          {children}
        </HypertuneRootProvider>
      </HypertuneHydrator>
    </HypertuneSourceProvider>
  );
}
