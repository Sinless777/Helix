export interface TelemetryConfig {
    profileEncryptionKey?: string;
    otel: {
      tracesExporter?: string;
      endpoint?: string;
      headers?: string;
      resourceAttributes?: string;
      nodeResourceDetectors?: string;
    };
    faro: {
      publicUrl?: string; // NEXT_PUBLIC_FARO_URL
    };
}