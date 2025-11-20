import { VercelEdgeConfigInitDataProvider } from "hypertune";
import { createClient } from "@vercel/edge-config";
import { unstable_noStore as noStore } from "next/cache";
import { createSource, emptySource } from "./hypertune";

// Prefer a graceful fallback when the hypertune token is missing so builds
// (static analysis / page data collection) don't fail. When the token is
// present we initialize the real source; otherwise we use an empty no-op
// source exported from the hypertune helper library.
const token = process.env.NEXT_PUBLIC_HYPERTUNE_TOKEN;

const hypertuneSource = token
  ? createSource({
      token,
      initDataProvider:
        process.env.EXPERIMENTATION_CONFIG &&
        process.env.EXPERIMENTATION_CONFIG_ITEM_KEY
          ? new VercelEdgeConfigInitDataProvider({
              edgeConfigClient: createClient(process.env.EXPERIMENTATION_CONFIG),
              itemKey: process.env.EXPERIMENTATION_CONFIG_ITEM_KEY,
            })
          : undefined,
    })
  : emptySource;

export default async function getHypertune() {
  noStore();

  // Only attempt initialization if the chosen source exposes initIfNeeded.
  // The emptySource is a stable fallback that won't perform network calls.
  // This prevents build-time failures when NEXT_PUBLIC_HYPERTUNE_TOKEN is not set.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initIfNeeded = (hypertuneSource as any)?.initIfNeeded;
  if (typeof initIfNeeded === "function") {
    // Await if present; otherwise skip.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await initIfNeeded.call(hypertuneSource as any);
  }

  return hypertuneSource;
}