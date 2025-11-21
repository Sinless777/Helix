import type { TelemetryConfig } from '@helix-ai/types';

export const telemetryConfig: TelemetryConfig = {
    profileEncryptionKey: process.env.PROFILE_ENCRYPTION_KEY,
    otel: {
      tracesExporter: process.env.OTEL_TRACES_EXPORTER,
      endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      headers: process.env.OTEL_EXPORTER_OTLP_HEADERS,
      resourceAttributes: process.env.OTEL_RESOURCE_ATTRIBUTES,
      nodeResourceDetectors: process.env.OTEL_NODE_RESOURCE_DETECTORS,
    },
    faro: {
      publicUrl: process.env.NEXT_PUBLIC_FARO_URL,
    },
}
