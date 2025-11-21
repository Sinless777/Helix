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

const token =
  process.env.INFISICAL_TOKEN ??
  process.env.INFISICAL_SERVICE_TOKEN ??
  process.env.INFISICAL_CLIENT_TOKEN;

const hasInfisicalConfig = Boolean(token && projectId);

const sdk = hasInfisicalConfig
  ? new InfisicalSDK({
      siteUrl: process.env.INFISICAL_SITE_URL,
    })
  : null;

const loadAllSecrets = async (): Promise<SecretMap> => {
  if (cache) return cache;
  if (priming) return priming;
  if (!sdk || !token) {
    cache = {};
    return cache;
  }

  priming = (async () => {
    try {
      const client = sdk.auth().accessToken(token);

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
      const all = [...(result.secrets ?? []), ...fromImports];

      for (const entry of all) {
        if (entry.secretKey && entry.secretValue !== undefined && entry.secretValue !== null) {
          secrets[entry.secretKey] = entry.secretValue;
        }
      }

      for (const [key, value] of Object.entries(secrets)) {
        if (!process.env[key]) process.env[key] = value;
      }

      cache = secrets;
      return secrets;
    } catch (err) {
      console.warn('[secrets] Failed to load from Infisical, falling back to env', err);
      cache = {};
      return cache;
    } finally {
      priming = null;
    }
  })();

  return priming;
};

export const hydrateEnvFromInfisical = async (): Promise<void> => {
  await loadAllSecrets();
};

export const getSecretFromCache = (name: string, fallback = ''): string => {
  if (process.env[name]) return process.env[name] as string;
  if (cache?.[name]) return cache[name];
  return fallback;
};

export const getSecrets = async (): Promise<SecretMap> => loadAllSecrets();
