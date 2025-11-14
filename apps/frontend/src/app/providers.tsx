"use client";

import { HelixProviders } from "@helix-ai/ui";
import type { Mode } from "@helix-ai/ui";
import type { ReactNode } from "react";

export type AppProvidersProps = {
  children: ReactNode;
  defaultMode?: "system" | Mode;
};

export function AppProviders({ children, defaultMode }: AppProvidersProps) {
  return <HelixProviders defaultMode={defaultMode}>{children}</HelixProviders>;
}
