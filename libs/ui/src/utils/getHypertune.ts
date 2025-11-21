// libs/ui/src/utils/getHypertune.ts

import { VercelEdgeConfigInitDataProvider } from 'hypertune';
import { createClient } from '@vercel/edge-config';
import { unstable_noStore as noStore } from 'next/cache';
import { emptyHypertuneSource } from '@helix-ai/core';
import { createSource } from '@helix-ai/core/hypertune';

type MaybeInit = { initIfNeeded?: () => Promise<void> };
type RootFn = (opts: { args: Record<string, unknown> }) => unknown;

const isServer = typeof window === 'undefined';
const hypertuneToken = process.env.NEXT_PUBLIC_HYPERTUNE_TOKEN || '';
const edgeConfigUrl = process.env.EXPERIMENTATION_CONFIG || '';
const edgeItemKey = process.env.EXPERIMENTATION_CONFIG_ITEM_KEY || '';

/**
 * Decide whether to wire a Vercel Edge Config init data provider.
 * We do a very light sanity check on the URL to avoid throwing during static analysis.
 */
function makeInitDataProvider() {
  const hasEdgeConfig = Boolean(edgeConfigUrl && edgeItemKey);
  if (!hasEdgeConfig) return null;

  // Basic URL sanity to prevent runtime errors in build steps.
  try {
    // Will throw if invalid URL. We intentionally ignore the result; validation is enough.
    new URL(edgeConfigUrl);
  } catch {
    // Invalid URL → skip provider (fail closed)
    return null;
  }

  return new VercelEdgeConfigInitDataProvider({
    edgeConfigClient: createClient(edgeConfigUrl),
    itemKey: edgeItemKey,
  });
}

/**
 * Build the hypertune source or return an inert no-op source.
 * We avoid side-effects until the first getHypertune() call.
 */
function buildHypertuneSource() {
  if (!hypertuneToken) return emptyHypertuneSource;

  return createSource({
    token: hypertuneToken,
    initDataProvider: makeInitDataProvider(),
    // You can add client-side caching / fetch options here if the SDK supports it.
  });
}

// Singleton cache so multiple imports don’t re-init the source.
let cachedSource: ReturnType<typeof buildHypertuneSource> | null = null;
let cachedRootPromise: Promise<unknown> | null = null;

/**
 * Optionally expose the raw source for advanced use-cases.
 */
export function getHypertuneSource() {
  if (!cachedSource) {
    cachedSource = buildHypertuneSource();
  }
  return cachedSource;
}

/**
 * Main entry: returns the Hypertune root, fully initialized if applicable.
 * - Safe in static builds (no token → inert emptySource).
 * - Safe in client bundles (noStore is server-only; we guard for server).
 * - Memoized to avoid redundant network calls per request lifecycle.
 */
export default async function getHypertune(): Promise<unknown> {
  if (isServer) {
    // Prevent Next.js from caching this result across requests.
    noStore();
  }

  if (!cachedSource) {
    cachedSource = buildHypertuneSource();
  }

  if (!cachedRootPromise) {
    cachedRootPromise = (async () => {
      const maybeInit = cachedSource as unknown as MaybeInit;

      // Initialize once if the concrete source supports it (emptySource won’t).
      if (typeof maybeInit.initIfNeeded === 'function') {
        try {
          await maybeInit.initIfNeeded();
        } catch (err) {
          // Fail closed: keep the app running with an inert source.
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[hypertune] initIfNeeded failed, falling back to empty source:', err);
          }
          cachedSource = emptyHypertuneSource;
        }
      }

      // Some SDKs expose .root as a method; others as a property. We handle both.
      const anySource = cachedSource as unknown as { root?: RootFn } & Record<string, unknown>;
      const rootFactory = typeof anySource.root === 'function' ? anySource.root : null;

      // Final guard: if rootFactory is absent, return the source itself to avoid throwing.
      return rootFactory ? rootFactory({ args: {} }) : anySource;
    })();
  }

  return cachedRootPromise;
}

/**
 * Optional convenience accessor for defaults coming from app config (if you need them).
 * Not used by getHypertune() directly, but handy for pre-populating UI with
 * design-time defaults when running fully offline.
 */
export function getHypertuneDefaults() {
  return {
    featureFlags: [] as Array<Record<string, unknown>>,
    environment:
      process.env.NEXT_PUBLIC_HYPERTUNE_ENVIRONMENT ??
      process.env.NEXT_PUBLIC_APP_ENV ??
      undefined,
    project: process.env.NEXT_PUBLIC_HYPERTUNE_PROJECT ?? undefined,
  };
}
