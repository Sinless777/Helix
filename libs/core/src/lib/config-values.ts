/**
 * Minimal configuration values shared across libs.
 * Keep this file small to avoid drawing in extra dependencies.
 */

export const uuidNamespace = process.env.UUID_NAMESPACE ?? '';

export const telemetry = {
  faroUrl: process.env.NEXT_PUBLIC_FARO_URL ?? '',
  faroAppName: process.env.NEXT_PUBLIC_FARO_APP_NAME ?? '',
  faroAppVersion: process.env.NEXT_PUBLIC_FARO_APP_VERSION ?? '',
  faroAppEnv: process.env.NEXT_PUBLIC_FARO_APP_ENV ?? '',
};
