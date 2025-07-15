// apps/UIs/Frontend/src/components/ClientHeader.tsx
'use client';

import dynamic from 'next/dynamic';

// Dynamically load Header only in browser
export const ClientHeader = dynamic(
  () => import('./header').then((mod) => mod.Header),
  { ssr: false }
);
