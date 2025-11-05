export type FaroConfig = {
  enabled: boolean;
  url?: string | null;
  appName?: string;
  appVersion?: string;
  environment?: string;
};

export type GrafanaCloudConfig = {
    addons?: {
        faro?: FaroConfig;
    }
};