// libs/config/src/config/hypertune.config.ts

// Avoid static node imports so browser bundles don't try to include fs/path.
import { parse as parseYaml } from 'yaml';

import type { FeatureFlag, HypertuneConfig, HypertuneEnvironment } from '@helix-ai/types';

type RawYaml = {
  feature_flags?: Array<{
    key: unknown;
    default_variant: unknown;
    description?: unknown;
  }>;
  environment?: {
    name?: unknown;
    description?: unknown;
  };
  project?: unknown;
};

// ---------- helpers ----------
function coerceBooleanStringNumber(v: unknown): boolean | string | number {
  if (typeof v === 'boolean' || typeof v === 'number') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true') return true;
    if (s === 'false') return false;
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
    return v; // keep as string
  }
  return false; // default fallback for nonsense values
}

function isEnvName(x: unknown): x is HypertuneEnvironment['name'] {
  return x === 'development' || x === 'staging' || x === 'production';
}

function loadYamlConfig(): {
  featureFlags: FeatureFlag[];
  environment?: HypertuneEnvironment;
  project?: string;
} {
  // Only attempt to read from disk in a Node runtime.
  let fs: typeof import('fs') | undefined;
  let path: typeof import('path') | undefined;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    fs = require('node:fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    path = require('node:path');
  } catch {
    return { featureFlags: [] };
  }

  if (!fs || !path) {
    return { featureFlags: [] };
  }

  const yamlPath = path.resolve(__dirname, '../hypertune/hypertune.yaml');

  if (!fs.existsSync(yamlPath)) {
    // No YAML present — return empty surface so env vars still drive the config
    return { featureFlags: [] };
  }

  const rawText = fs.readFileSync(yamlPath, 'utf8');
  const doc = (parseYaml(rawText) ?? {}) as RawYaml;

  // Map feature flags
  const featureFlags: FeatureFlag[] = (doc.feature_flags ?? [])
    .map((f, idx) => {
      const key = typeof f.key === 'string' ? f.key.trim() : '';
      if (!key) return undefined;

      const default_variant = coerceBooleanStringNumber(f.default_variant);
      const description =
        typeof f.description === 'string' && f.description.trim().length > 0
          ? f.description.trim()
          : `Flag #${idx + 1}`;

      return { key, default_variant, description };
    })
    .filter((v): v is FeatureFlag => Boolean(v));

  // Map environment (optional)
  let environment: HypertuneEnvironment | undefined;
  if (doc.environment) {
    const nameCandidate = typeof doc.environment.name === 'string' ? doc.environment.name.trim() : '';
    if (isEnvName(nameCandidate)) {
      environment = {
        name: nameCandidate,
        description:
          typeof doc.environment.description === 'string'
            ? doc.environment.description.trim()
            : '',
      };
    }
  }

  // Map project (optional)
  const project =
    typeof doc.project === 'string' && doc.project.trim().length > 0 ? doc.project.trim() : undefined;

  return { featureFlags, environment, project };
}

// ---------- assemble config ----------
const fromYaml = loadYamlConfig();

export const hypertuneConfig: HypertuneConfig = {
  token: process.env.NEXT_PUBLIC_HYPERTUNE_TOKEN || '',
  configItemKey: process.env.EXPERIMENTATION_CONFIG_ITEM_KEY || '',
  configUrl: process.env.EXPERIMENTATION_CONFIG || '',
  framework: process.env.HYPERTUNE_FRAMEWORK || '',
  outputDir: process.env.HYPERTUNE_OUTPUT_DIRECTORY_PATH || '',
  featureFlags: fromYaml.featureFlags,
  environment: fromYaml.environment,
  project: fromYaml.project,
};
