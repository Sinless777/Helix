# Kubernetes Observability & Platform Rollout

Helix is rolling out the following foundational services across Kubernetes environments. Track implementation progress via the linked GitHub issues.

| Category | Component | Tracking Issue | Notes |
| --- | --- | --- | --- |
| Monitoring | kube-prometheus-stack | [#133](https://github.com/Sinless777/Helix/issues/133) | Unified Prometheus, Alertmanager, Grafana deployment across clusters. |
| Service Mesh | Kiali | [#134](https://github.com/Sinless777/Helix/issues/134) | Visualize Istio traffic, config validation, and topology insights. |
| Logging | Loki | [#135](https://github.com/Sinless777/Helix/issues/135) | Centralized log aggregation with Promtail ingestion. |
| Metrics Storage | Grafana Mimir | [#136](https://github.com/Sinless777/Helix/issues/136) | Long-term metrics retention and horizontal scale. |
| Profiling | Pyroscope | [#137](https://github.com/Sinless777/Helix/issues/137) | Continuous profiling for CPU/memory hotspots. |
| eBPF Telemetry | Grafana Beyla | [#138](https://github.com/Sinless777/Helix/issues/138) | Zero-code RED metrics via eBPF agents. |
| Tracing | Grafana Tempo | [#139](https://github.com/Sinless777/Helix/issues/139) | Distributed tracing backend with object storage. |
| Reference App | Echo Server | [#140](https://github.com/Sinless777/Helix/issues/140) | Platform smoke test and integration reference. |
| Frontend RUM | Grafana Faro | [#141](https://github.com/Sinless777/Helix/issues/141) | Client-side observability for Helix web apps. |
| Telemetry Agent | Grafana Alloy | [#142](https://github.com/Sinless777/Helix/issues/142) | Unified metrics/logs/traces ingestion pipelines. |
| Incident Response | Grafana OnCall | [#143](https://github.com/Sinless777/Helix/issues/143) | Managed alert routing and escalation policies. |
| Load Testing | k6 Operator | [#144](https://github.com/Sinless777/Helix/issues/144) | Declarative performance testing within Kubernetes. |
| Collectors & UI | OpenTelemetry Collector + Jaeger | [#145](https://github.com/Sinless777/Helix/issues/145) | Standardized telemetry pipelines and trace UI. |
| Data Platform | Redis & Redis Vector Store | [#146](https://github.com/Sinless777/Helix/issues/146) | Managed caching and vector search capabilities. |
| Data Platform | CockroachDB | [#147](https://github.com/Sinless777/Helix/issues/147) | Distributed SQL backend for transactional workloads. |
| Messaging | NATS | [#148](https://github.com/Sinless777/Helix/issues/148) | Lightweight messaging and streaming with JetStream. |

> ℹ️ Status and checklist details live in each linked issue. Update this table as milestones progress.
