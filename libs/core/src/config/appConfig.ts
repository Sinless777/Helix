import type { AppConfig } from '@helix-ai/types';
import { githubConfig } from './github.config';
import { grafanaCloudConfig } from './grafana-cloud.config';
import { authConfig } from './auth.config';
import { securityConfig } from './security.config';
import { telemetryConfig } from './telemetry.config';
import { servicesConfig } from './services';
import { supabaseConfig } from './supabase.config';
import { redisConfig } from './redis.config';
import { hypertuneConfig } from './hypertune.config';

export const appConfig: AppConfig = {
  github: githubConfig,
  grafanaCloud: grafanaCloudConfig,
  security: securityConfig,
  authConfig: authConfig,
  telemetry: telemetryConfig,
  services: servicesConfig,
  supabase: supabaseConfig,
  redis: redisConfig,
  hypertune: hypertuneConfig,
  publicTokens: {
    profileEncryptionKey: process.env.NEXT_PUBLIC_PROFILE_ENCRYPTION_KEY || '',
  },
};
