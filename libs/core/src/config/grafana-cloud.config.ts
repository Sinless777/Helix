import { GrafanaCloudConfig } from '@helix-ai/types';

export const grafanaCloudConfig: GrafanaCloudConfig = {
    addons: {
        faro: {
            enabled: true,
            // Use values from the Grafana example provided
            appName: 'Helix-Ai',
            // Bump this manually when releasing a new app version
            appVersion: '1.0.0',
            // Hard-set environment to match the Grafana example (production)
            environment: 'production',

            // Secrets (endpoint URLs / write keys) MUST come from env vars.
            // Keep these as env-vars so secrets are not checked into source control.
            url: process.env.NEXT_PUBLIC_FARO_URL ?? null,
        },
    },
};
