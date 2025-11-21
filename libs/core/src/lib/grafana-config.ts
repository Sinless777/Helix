/**
 * Minimal Grafana/Faro config shared between libs without extra deps.
 */
export interface GrafanaCloudConfig {
  addons: {
    faro: {
      enabled: boolean;
      appName: string;
      appVersion: string;
      environment: string;
      url: string | null;
    };
  };
}

export const grafanaCloudConfig: GrafanaCloudConfig = {
  addons: {
    faro: {
      enabled: true,
      appName: 'Helix-Ai',
      appVersion: '1.0.0',
      environment: 'production',
      url: process.env.NEXT_PUBLIC_FARO_URL ?? null,
    },
  },
};
