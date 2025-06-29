import { CardProps } from "@/components/Card";

export const ObservabilityCards: CardProps[] = [
  {
    title: "Observability",
    description:
      "Metrics, logs, traces, continuous profiling, alerting, on‑call management, and supplemental tooling from the complete Grafana OSS ecosystem (LGTM + extras).",
    listItems: [
      {
        text: "Grafana 11.0",
        href: "https://grafana.com/",
        role: "Dashboards & Visualization",
        detailedDescription:
          "Grafana 11 (Jun 2025) debuts Scenes‑powered drag‑and‑drop dashboards, AI‑assisted panel hints, and unified alerting UX; new WebGL Canvas & Geomap panels render large datasets with 5× higher FPS."
      },
      {
        text: "Prometheus 2.52.0",
        href: "https://prometheus.io/",
        role: "Metrics Collection",
        detailedDescription:
          "Prometheus 2.52 (May 2025) adds an adaptive PromQL executor that parallelises queries across remote‑read backends and ships a GA OTLP receiver for native OpenTelemetry metrics ingestion."
      },
      {
        text: "Grafana Mimir 2.16",
        href: "https://grafana.com/oss/mimir/",
        role: "Scalable Metrics Backend",
        detailedDescription:
          "Mimir 2.16 (Apr 2025) scales Prometheus to billions of series with horizontally‑sharded ingesters and durable object‑store blocks; v2.16 trims compactor memory 35 % and introduces cardinality dashboards."
      },
      {
        text: "Loki 3.0",
        href: "https://grafana.com/oss/loki/",
        role: "Log Aggregation",
        detailedDescription:
          "Loki 3.0 (Dec 2024) replaces Boltdb‑shipper with a TSDB‑style index, supports query‑frontier gap‑filling, and adds native Azure Blob storage, cutting index footprint by 30 %."
      },
      {
        text: "Tempo 2.4",
        href: "https://grafana.com/oss/tempo/",
        role: "Tracing Backend",
        detailedDescription:
          "Tempo 2.4 (Feb 2025) graduates TraceQL to GA, introduces span‑metrics export to Prometheus, and halves cold‑trace retrieval latency via tiered object‑store caching."
      },
      {
        text: "Pyroscope 1.7",
        href: "https://grafana.com/oss/pyroscope/",
        role: "Continuous Profiling",
        detailedDescription:
          "Pyroscope 1.7 (Mar 2025) merges Grafana Phlare enhancements, adds eBPF system‑wide profiling, ingest‑time relabeling, and PGO‑friendly `pprof` export for performance regression surfacing."
      },
      {
        text: "Grafana Alloy 1.9",
        href: "https://grafana.com/docs/alloy/latest/",
        role: "Telemetry Collector",
        detailedDescription:
          "Alloy 1.9 (May 2025) unifies Prometheus scraping and OTLP pipelines, offers dynamic component reloading, and ships Pyroscope/Loki native exporters—replacing the deprecated Grafana Agent."
      },
      {
        text: "Grafana Faro 1.4",
        href: "https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/",
        role: "Frontend Observability SDK",
        detailedDescription:
          "Faro 1.4 (Jul 2024) GA’s browser SDK for Core Web Vitals, errors, logs, and traces; v1.4 adds Performance Timeline & Fetch instrumentation, RudderStack support, and Scenes‑ready dashboards."
      },
      {
        text: "Grafana Beyla 1.3",
        href: "https://grafana.com/oss/beyla-ebpf/",
        role: "eBPF Auto‑Instrumentation",
        detailedDescription:
          "Beyla 1.3 (Nov 2024) captures RED metrics and basic spans for HTTP/gRPC services with zero code changes using eBPF; new version adds TLS handshake tracing and automatic Kubernetes pod labels."
      },
      {
        text: "k6 0.57",
        href: "https://grafana.com/oss/k6/",
        role: "Load & Performance Testing",
        detailedDescription:
          "k6 0.57 (May 2025) adds browser‑level WebGPU simulation, introduces test‑run artifacts to Tempo, and syncs test insights straight into Grafana dashboards; k6 Studio v1.0 delivers drag‑and‑drop script authoring."
      },
      {
        text: "GoAlert 0.33.0",
        href: "https://goalert.me/",
        role: "On‑Call Management (OSS)",
        detailedDescription:
          "GoAlert 0.33.0 (Nov 2024) is an Apache‑2.0‑licensed on‑call scheduler with rotations, escalations, and multi‑channel notifications. It offers first‑class Prometheus Alertmanager webhooks, a built‑in Prometheus exporter, and Grafana dashboards—making it a fully supported, drop‑in open‑source alternative that integrates seamlessly with the LGTM stack."
      },
      {
        text: "Jaeger 1.55.0",
        href: "https://www.jaegertracing.io/",
        role: "Distributed Tracing",
        detailedDescription:
          "Jaeger 1.55 (Apr 2025) adds OTLP native ingest, upgrades storage plugins, and deprecates the UDP agent in favour of gRPC collectors."
      },
      {
        text: "Alertmanager 0.28",
        href: "https://prometheus.io/docs/alerting/latest/alertmanager/",
        role: "Alert Routing",
        detailedDescription:
          "Alertmanager 0.28 (May 2025) introduces receiver‑level tenant IDs for SaaS isolation, WebSocket silences feed, and removes legacy v1 APIs."
      },
      {
        text: "OpenTelemetry 1.5",
        href: "https://opentelemetry.io/",
        role: "Unified Observability Standard",
        detailedDescription:
          "OpenTelemetry 1.5 spec (May 2025) stabilises logging APIs, finalises semantic conventions 1.0, and enables unified OTLP pipelines for logs, metrics, and traces."
      }
    ],
    image: "https://cdn.sinlessgamesllc.com/Helix-AI/images/technology/Observability.png",
    link: "/observability",
    buttonText: "Explore suite"
  }
];
