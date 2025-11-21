/**
 * Lightweight Infisical integration:
 *  - hydrateEnvFromInfisical(): fetches all secrets for the configured env/path and populates process.env
 *  - getSecretFromCache(): reads from process.env or the hydrated cache with a fallback
 */
import { InfisicalClient } from '@infisical/sdk';

type SecretMap = Record<string, string>;

let cache: SecretMap | null = null;
let priming: Promise<SecretMap> | null = null;

const envName =
  process.env.INFISICAL_ENVIRONMENT ??
  process.env.INFISICAL_ENV ??
  process.env.NODE_ENV ??
  'development';
const secretPath = process.env.INFISICAL_PATH ?? '/';

async function loadAllSecrets(): Promise<SecretMap> {
  if (cache) return cache;
  if (priming) return priming;
  if (!process.env.INFISICAL_TOKEN) {
    cache = {};
    return cache;
  }

  priming = (async () => {
    try {
      const client = new InfisicalClient({
        token: process.env.INFISICAL_TOKEN as string,
        siteUrl: process.env.INFISICAL_SITE_URL,
      });

      const result = await client.getAllSecrets({
        environment: envName,
        path: secretPath,
      });

      const secrets: SecretMap = {};
      for (const entry of result?.secrets ?? []) {
        if (entry.secretName && entry.secretValue !== undefined && entry.secretValue !== null) {
          secrets[entry.secretName] = entry.secretValue;
        }
      }

      // Populate process.env for sync consumers.
      for (const [key, value] of Object.entries(secrets)) {
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }

      cache = secrets;
      return secrets;
    } catch (err) {
      // Fail closed: just return an empty map so we fall back to env vars.
      console.warn('[infisical] Failed to load secrets; falling back to process.env', err);
      cache = {};
      return cache;
    }
  })();

  return priming;
}

export async function hydrateEnvFromInfisical(): Promise<void> {
  await loadAllSecrets();
}

export function getSecretFromCache(name: string, fallback = ''): string {
  if (process.env[name]) return process.env[name] as string;
  if (cache && cache[name]) return cache[name];
  return fallback;
}
