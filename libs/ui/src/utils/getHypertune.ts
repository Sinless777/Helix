// libs/ui/src/utils/getHypertune.ts
import { VercelEdgeConfigInitDataProvider } from 'hypertune';
import { createClient } from '@vercel/edge-config';
import { unstable_noStore as noStore } from 'next/cache';
import { createSource, emptySource } from '@helix-ai/hypertune';

// Gracefully fallback to an empty no-op source when the token is not set so
// builds (static page collection) don't fail. When a token is present we use
// the real hypertune source.
const hypertuneToken = process.env.NEXT_PUBLIC_HYPERTUNE_TOKEN;

const hypertuneSource = hypertuneToken
  ? createSource({
      token: hypertuneToken,
      initDataProvider:
        process.env.EXPERIMENTATION_CONFIG && process.env.EXPERIMENTATION_CONFIG_ITEM_KEY
          ? new VercelEdgeConfigInitDataProvider({
              edgeConfigClient: createClient(process.env.EXPERIMENTATION_CONFIG),
              itemKey: process.env.EXPERIMENTATION_CONFIG_ITEM_KEY,
            })
          : null,
    })
  : emptySource;

export default async function getHypertune(): Promise<any> {
  noStore();

  // Only call initIfNeeded if available on the source (emptySource won't
  // perform network calls).
  const initIfNeeded = (hypertuneSource as any)?.initIfNeeded;
  if (typeof initIfNeeded === 'function') {
    await initIfNeeded.call(hypertuneSource as any);
  }

  // Widening to any because emptySource may not include runtime helpers.
  const root = (hypertuneSource as any).root({ args: {} as any });
  return root;
}
