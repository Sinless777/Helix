import "server-only";
import { VercelEdgeConfigInitDataProvider } from "hypertune";
import { createClient } from "@vercel/edge-config";
import { unstable_noStore as noStore } from "next/cache";
import { createSource } from "./hypertune";

const token = process.env.NEXT_PUBLIC_HYPERTUNE_TOKEN;
if (!token) {
  throw new Error("Missing required environment variable NEXT_PUBLIC_HYPERTUNE_TOKEN");
}

const hypertuneSource = createSource({
  token,
  initDataProvider:
    process.env.EXPERIMENTATION_CONFIG &&
    process.env.EXPERIMENTATION_CONFIG_ITEM_KEY
      ? new VercelEdgeConfigInitDataProvider({
          edgeConfigClient: createClient(
            process.env.EXPERIMENTATION_CONFIG,
          ),
          itemKey: process.env.EXPERIMENTATION_CONFIG_ITEM_KEY,
        })
      : undefined,
});

export default async function getHypertune() {
  noStore();
  await hypertuneSource.initIfNeeded(); // Check for flag updates

  return hypertuneSource
}