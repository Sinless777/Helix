/**
 * Lightweight Infisical integration:
 *  - hydrateEnvFromInfisical(): fetches all secrets for the configured env/path and populates process.env
 *  - getSecretFromCache(): reads from process.env or the hydrated cache with a fallback
 */
import { InfisicalSDK } from '@infisical/sdk';

type SecretMap = Record<string, string>;

let cache: SecretMap | null = null;
let priming: Promise<SecretMap> | null = null;

const envName =
  process.env.INFISICAL_ENVIRONMENT ??
  process.env.INFISICAL_ENV ??
  process.env.NODE_ENV ??
  'development';
const secretPath = process.env.INFISICAL_PATH ?? '/';
const projectId =
  process.env.INFISICAL_PROJECT_ID ??
  process.env.INFISICAL_PROJECT ??
  process.env.NEXT_PUBLIC_INFISICAL_PROJECT_ID ??
  '';

async function loadAllSecrets(): Promise<SecretMap> {
  if (cache) return cache;
  if (priming) return priming;
  if (!process.env.INFISICAL_TOKEN || !projectId) {
    cache = {};
    return cache;
  }

  priming = (async () => {
    try {
      const sdk = new InfisicalSDK({
        siteUrl: process.env.INFISICAL_SITE_URL,
      });

      const client = sdk.auth().accessToken(process.env.INFISICAL_TOKEN as string);

      const result = await client.secrets().listSecrets({
        projectId,
        environment: envName,
        secretPath,
        includeImports: true,
        attachToProcessEnv: false,
        recursive: true,
      });

      const secrets: SecretMap = {};
      const fromImports = (result.imports ?? []).flatMap((group) => group.secrets ?? []);
      const allSecrets = [...(result?.secrets ?? []), ...fromImports];
      for (const entry of allSecrets) {
        if (entry.secretKey && entry.secretValue !== undefined && entry.secretValue !== null) {
          secrets[entry.secretKey] = entry.secretValue;
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
