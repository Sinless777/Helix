'use client';

import { getWebInstrumentations, initializeFaro, faro as faroGlobal } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import { grafanaCloudConfig } from '@helix-ai/core';

let faroSingleton: ReturnType<typeof initializeFaro> | null = null;

type FaroClientConfig = {
  url: string;
  appName: string;
  appVersion: string;
  environment: string;
};

function buildConfig(overrides: Partial<FaroClientConfig> = {}): FaroClientConfig | null {
  const faro = grafanaCloudConfig?.addons?.faro;
  if (!faro) return null;

  const url =
    overrides.url ??
    faro.url ??
    (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FARO_URL : '') ??
    '';

  if (!url) return null;

  return {
    url,
    appName:
      overrides.appName ??
      faro.appName ??
      (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FARO_APP_NAME : '') ??
      'helix-app',
    appVersion:
      overrides.appVersion ??
      faro.appVersion ??
      (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FARO_APP_VERSION : '') ??
      (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_APP_VERSION : '') ??
      'dev',
    environment:
      overrides.environment ??
      faro.environment ??
      (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FARO_APP_ENV : '') ??
      (typeof process !== 'undefined' ? process.env.NODE_ENV : '') ??
      'development'
  };
}

export function initFaro(overrides: Partial<FaroClientConfig> = {}) {
  if (typeof window === 'undefined') return null;

  // If Faro already exists (e.g., HMR, multiple inits), reuse it.
  if (faroSingleton || (faroGlobal as any)?._enabled) {
    return faroSingleton ?? (faroGlobal as any) ?? null;
  }

  const config = buildConfig(overrides);
  if (!config) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[Faro] configuration missing; skipping.');
    }
    return null;
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      console.info('[Faro] initializing', {
        app: { name: config.appName, version: config.appVersion, environment: config.environment }
      });
    }

    faroSingleton = initializeFaro({
      url: config.url,
      app: {
        name: config.appName,
        version: config.appVersion,
        environment: config.environment
      },
      instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()]
    });
  } catch (err) {
    console.error('[Faro] failed to initialize:', err instanceof Error ? err.message : err);
    faroSingleton = null;
  }

  return faroSingleton;
}

export function getFaroInstance() {
  return faroSingleton ?? (faroGlobal as any) ?? null;
}
