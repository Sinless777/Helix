import type { GithubConfig } from './github';
import type { GrafanaCloudConfig } from './grafana-cloud';
import type { RedisConfig } from './redis';
import type { SecurityConfig } from './security';
import type { AuthConfig } from './auth';
import type { TelemetryConfig } from './telemetry';
import type { ServicesConfig } from './services';
import type { SupabaseConfig } from './supabase';
import { HypertuneConfig } from './hypertune';

export type AppConfig = {
  github: GithubConfig;
  grafanaCloud: GrafanaCloudConfig;
  security: SecurityConfig;
  authConfig: AuthConfig;
  telemetry: TelemetryConfig;
  services: ServicesConfig;
  supabase: SupabaseConfig;
  redis: RedisConfig;
  hypertune: HypertuneConfig;
  publicTokens: {
    profileEncryptionKey?: string; // NEXT_PUBLIC_PROFILE_ENCRYPTION_KEY
  };
};
