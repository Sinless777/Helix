import { loadConfig } from '../env/app-config';

const schema = {
  nodeEnv: { key: 'NODE_ENV', default: 'development' },
  appUrl: { key: 'APP_URL', required: true },
  redisUrl: { key: 'REDIS_URL' },
  contentfulToken: { key: 'CONTENTFUL_TOKEN' },
  featureFlags: { key: 'FEATURE_FLAGS', default: '{}' },
};

export type AppConfig = {
  nodeEnv: string;
  appUrl: string;
  redisUrl?: string;
  contentfulToken?: string;
  featureFlags: Record<string, boolean>;
};

export const buildAppConfig = (): AppConfig => {
  const raw = loadConfig<Record<keyof typeof schema, unknown>>(schema as any);
  const featureFlags =
    typeof raw.featureFlags === 'string' ? JSON.parse(raw.featureFlags) : {};
  return {
    nodeEnv: (raw.nodeEnv as string) ?? 'development',
    appUrl: raw.appUrl as string,
    redisUrl: raw.redisUrl as string | undefined,
    contentfulToken: raw.contentfulToken as string | undefined,
    featureFlags,
  };
};
