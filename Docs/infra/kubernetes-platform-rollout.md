# Kubernetes Observability & Platform Rollout

Helix is rolling out the following foundational services across Kubernetes environments. Track implementation progress via the linked GitHub issues.

| Category          | Component                        | Tracking Issue                                         | Notes                                                                 |
| ----------------- | -------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| Monitoring        | kube-prometheus-stack            | [#133](https://github.com/Sinless777/Helix/issues/133) | Unified Prometheus, Alertmanager, Grafana deployment across clusters. |
| Service Mesh      | Kiali                            | [#134](https://github.com/Sinless777/Helix/issues/134) | Visualize Istio traffic, config validation, and topology insights.    |
| Logging           | Loki                             | [#135](https://github.com/Sinless777/Helix/issues/135) | Centralized log aggregation with Promtail ingestion.                  |
| Metrics Storage   | Grafana Mimir                    | [#136](https://github.com/Sinless777/Helix/issues/136) | Long-term metrics retention and horizontal scale.                     |
| Profiling         | Pyroscope                        | [#137](https://github.com/Sinless777/Helix/issues/137) | Continuous profiling for CPU/memory hotspots.                         |
| eBPF Telemetry    | Grafana Beyla                    | [#138](https://github.com/Sinless777/Helix/issues/138) | Zero-code RED metrics via eBPF agents.                                |
| Tracing           | Grafana Tempo                    | [#139](https://github.com/Sinless777/Helix/issues/139) | Distributed tracing backend with object storage.                      |
| Reference App     | Echo Server                      | [#140](https://github.com/Sinless777/Helix/issues/140) | Platform smoke test and integration reference.                        |
| Frontend RUM      | Grafana Faro                     | [#141](https://github.com/Sinless777/Helix/issues/141) | Client-side observability for Helix web apps.                         |
| Telemetry Agent   | Grafana Alloy                    | [#142](https://github.com/Sinless777/Helix/issues/142) | Unified metrics/logs/traces ingestion pipelines.                      |
| Incident Response | Grafana OnCall                   | [#143](https://github.com/Sinless777/Helix/issues/143) | Managed alert routing and escalation policies.                        |
| Load Testing      | k6 Operator                      | [#144](https://github.com/Sinless777/Helix/issues/144) | Declarative performance testing within Kubernetes.                    |
| Collectors & UI   | OpenTelemetry Collector + Jaeger | [#145](https://github.com/Sinless777/Helix/issues/145) | Standardized telemetry pipelines and trace UI.                        |
| Data Platform     | Redis & Redis Vector Store       | [#146](https://github.com/Sinless777/Helix/issues/146) | Managed caching and vector search capabilities.                       |
| Data Platform     | CockroachDB                      | [#147](https://github.com/Sinless777/Helix/issues/147) | Distributed SQL backend for transactional workloads.                  |
| Messaging         | NATS                             | [#148](https://github.com/Sinless777/Helix/issues/148) | Lightweight messaging and streaming with JetStream.                   |

> ℹ️ Status and checklist details live in each linked issue. Update this table as milestones progress.

## Rollout Phases

Breaking delivery into phases keeps the Helix GA infrastructure push manageable while surfacing cross-cutting dependencies early. Each phase maps to the issues tracked in this repo.

### Phase 1 — Core Monitoring & Metrics

- [#133](https://github.com/Sinless777/Helix/issues/133): kube-prometheus-stack baseline across clusters
- [#134](https://github.com/Sinless777/Helix/issues/134): Kiali console for service mesh visibility
- [#135](https://github.com/Sinless777/Helix/issues/135): Grafana Loki central logging
- [#136](https://github.com/Sinless777/Helix/issues/136): Grafana Mimir for long-term metrics retention

### Phase 2 — Deep Telemetry & Profiling

- [#137](https://github.com/Sinless777/Helix/issues/137): Pyroscope continuous profiling rollout
- [#138](https://github.com/Sinless777/Helix/issues/138): Grafana Beyla eBPF agents for RED metrics
- [#139](https://github.com/Sinless777/Helix/issues/139): Grafana Tempo distributed tracing backend
- [#145](https://github.com/Sinless777/Helix/issues/145): Managed OpenTelemetry Collector and Jaeger UI

### Phase 3 — Operational Readiness & Response

- [#140](https://github.com/Sinless777/Helix/issues/140): Echo server reference workload to validate pipelines
- [#141](https://github.com/Sinless777/Helix/issues/141): Grafana Faro frontend telemetry integration
- [#142](https://github.com/Sinless777/Helix/issues/142): Grafana Alloy unified edge telemetry agent
- [#143](https://github.com/Sinless777/Helix/issues/143): Grafana OnCall incident routing
- [#144](https://github.com/Sinless777/Helix/issues/144): k6 operator for automated load testing

> 🎯 Once Phase 3 completes we have the minimum observability posture required for GA cutover. Data and messaging platform work (#146–#148) proceeds in parallel and is documented separately.

## Readiness Checklist Snapshot

| Phase | Exit Criteria | Linked Issues |
| ----- | ------------- | ------------- |
| Phase 1 | Prometheus, Kiali, Loki, and Mimir serving traffic in dev and staging with dashboards published. | [#133](https://github.com/Sinless777/Helix/issues/133), [#134](https://github.com/Sinless777/Helix/issues/134), [#135](https://github.com/Sinless777/Helix/issues/135), [#136](https://github.com/Sinless777/Helix/issues/136) |
| Phase 2 | Profiling, eBPF, tracing, and collector pipelines validated end-to-end with sampling documented. | [#137](https://github.com/Sinless777/Helix/issues/137), [#138](https://github.com/Sinless777/Helix/issues/138), [#139](https://github.com/Sinless777/Helix/issues/139), [#145](https://github.com/Sinless777/Helix/issues/145) |
| Phase 3 | Synthetic checks green, incident routing rehearsed, and load suites automated across environments. | [#140](https://github.com/Sinless777/Helix/issues/140), [#141](https://github.com/Sinless777/Helix/issues/141), [#142](https://github.com/Sinless777/Helix/issues/142), [#143](https://github.com/Sinless777/Helix/issues/143), [#144](https://github.com/Sinless777/Helix/issues/144) |
