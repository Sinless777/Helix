// libs/ui/src/utils/getHypertune.ts
import { VercelEdgeConfigInitDataProvider } from 'hypertune';
import { createClient } from '@vercel/edge-config';
import { unstable_noStore as noStore } from 'next/cache';
import { createSource } from '@helix/hypertune';

const hypertuneToken = process.env.NEXT_PUBLIC_HYPERTUNE_TOKEN;
if (!hypertuneToken) {
  throw new Error('Environment variable NEXT_PUBLIC_HYPERTUNE_TOKEN is required to initialize hypertuneSource');
}

const hypertuneSource = createSource({
  token: hypertuneToken,
  initDataProvider:
    process.env.EXPERIMENTATION_CONFIG && process.env.EXPERIMENTATION_CONFIG_ITEM_KEY
      ? new VercelEdgeConfigInitDataProvider({
          edgeConfigClient: createClient(process.env.EXPERIMENTATION_CONFIG),
          itemKey: process.env.EXPERIMENTATION_CONFIG_ITEM_KEY,
        })
      : null,
});

export default async function getHypertune(): Promise<any> {
  noStore();
  // Cast to any so TS doesn’t complain (method may exist at runtime)
  await (hypertuneSource as any).initIfNeeded();

  // Using `any` / widen because the real type maybe missing the methods
  const root = (hypertuneSource as any).root({ args: {} as any });
  return root;
}
