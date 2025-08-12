"use client";

import React from "react";
import {
  Box,
  Typography,
  Divider,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // Classic Grid for broad compatibility (v5+)

export default function ArchitecturePage() {
  return (
    <Box component="main" sx={{ p: { xs: 2, sm: 4, md: 6 }, gap: 3 }}>
      <Typography variant="h3" gutterBottom>
        Helix Architecture
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        A cloud-agnostic, cloud-native, microservices-first platform designed for scale, security, portability, and rapid iteration.
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {/* High-Level Topology */}
      <Typography variant="h5" gutterBottom>
        High-Level Topology
      </Typography>
      <Typography paragraph>
        Helix is organized as a set of loosely coupled services communicating via gRPC/HTTP and <strong>NATS (JetStream)</strong>.
        A Next.js web UI and channel adapters (Discord/Slack/etc.) interact with API Gateways which route
        requests to domain services and the Model Orchestrator. Cloudflare sits at the edge for CDN/WAF and
        private ingress is provided via <strong>cloudflared</strong> tunnels. A service mesh enforces mTLS, policies,
        and traffic shaping. Observability and DevSecOps are embedded across the stack.
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Edge & UI", desc: "Next.js (App Router), SSR/ISR, Cloudflare CDN/WAF, cloudflared tunnels" },
          { label: "API Gateway", desc: "GraphQL (NestJS/Apollo) ingress, authN/Z, rate limits" },
          { label: "Service Mesh", desc: "mTLS, retries/timeouts, traffic split, policy" },
          { label: "Event Bus", desc: "NATS JetStream, outbox pattern, Sagas" },
          { label: "Model Layer", desc: "LLM router, safety filters, streaming, caching" },
          { label: "Data Layer", desc: "CockroachDB, Redis, ELKB (Elasticsearch, Logstash, Kibana, Beats), Object/Vector storage" },
          { label: "Observability", desc: "OpenTelemetry, Prometheus, Loki, Mimir, Pyroscope, Beyla, k6, Grafana, Jaeger, Kiali, Alloy" },
          { label: "CI/CD", desc: "GitHub Actions → FluxCD, canary/blue-green deploys" },
        ].map((card) => (
          <Grid key={card.label} size={{ xs: 12, md: 6, lg: 3 }}>
            <Card sx={{ height: "100%", borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  {card.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Frontend Platform */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 2 }}>
        Frontend Platform
      </Typography>
      <Typography paragraph>
        The UI is built with Next.js (App Router) and MUI, leveraging SSR/ISR for performance and SEO. Cloudflare provides
        global caching and WAF at the edge. Edge middleware enables auth checks, A/B experiments, and feature flags before
        a request reaches the origin. Real-time updates stream via Server-Sent Events (SSE) or WebSockets for long-running tasks.
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText primary="Auth & RBAC" secondary="JWT + session tokens, role-aware navigation" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Accessibility" secondary="WCAG-compliant components and semantics" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Internationalization" secondary="Locale routing, ICU message formats" />
        </ListItem>
      </List>

      {/* API Gateways & Protocols */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 4 }}>
        API Gateways & Protocols
      </Typography>
      <Typography paragraph>
        Ingress traffic terminates at an API Gateway that exposes <strong>GraphQL (NestJS/Apollo)</strong> as the primary contract for
        external clients, with optional REST endpoints where appropriate, and gRPC for service-to-service contracts. Gateways
        centralize authN/Z, schema validation, rate limiting, and request shaping. For streaming, Helix supports GraphQL
        subscriptions (WebSocket), server streaming (gRPC), and chunked HTTP responses.
      </Typography>

      {/* Service Mesh & Networking */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 4 }}>
        Service Mesh & Networking
      </Typography>
      <Typography paragraph>
        A mesh (e.g., Istio/Linkerd) provides mutual TLS, retries/timeouts, circuit breakers, and traffic splitting for canary
        releases. Network policies restrict east-west traffic; egress gateways broker controlled access to external APIs. Private
        ingress into internal services is established via <strong>Cloudflare Tunnel (cloudflared)</strong>.
      </Typography>

      {/* Eventing & Orchestration */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 4 }}>
        Eventing & Orchestration
      </Typography>
      <Typography paragraph>
        The event bus is <strong>NATS (JetStream)</strong>, which decouples producers and consumers with subject-based pub/sub,
        durable consumers, and exactly-once–like processing via idempotent handlers. We employ the outbox pattern to guarantee
        delivery and Sagas for long-running, multi-service transactions. Request-reply and key-value buckets support command and
        state synchronization patterns.
      </Typography>

      {/* Data Layer */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 4 }}>
        Data Layer
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { h: "Relational", b: "CockroachDB/Postgres for core entities and strong consistency" },
          { h: "Cache", b: "Redis for hot paths, queues, and distributed locks" },
          { h: "Search/Analytics", b: "Elasticsearch/OpenSearch for logs, search, aggregation" },
          { h: "Object Store", b: "S3/MinIO for artifacts, datasets, and attachments" },
          { h: "Vector Index", b: "pgvector/Weaviate for embeddings and semantic recall" },
        ].map((x) => (
          <Grid key={x.h} size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={700}>{x.h}</Typography>
                <Typography variant="body2" color="text.secondary">{x.b}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Model Orchestration */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 4 }}>
        Model Orchestration
      </Typography>
      <Typography paragraph>
        A dedicated Orchestrator routes requests among proprietary LLMs and external providers based on sensitivity, latency SLAs,
        and cost. Safety filters (PII redaction, toxicity checks), tool use (function calling), and streaming responses are
        first-class. A registry tracks model versions, performance, and rollback history.
      </Typography>
      <List dense>
        <ListItem><ListItemText primary="Routing" secondary="Policy-driven selection, fallback chains, circuit breakers" /></ListItem>
        <ListItem><ListItemText primary="Caching" secondary="Prompt/result caches, embedding dedupe" /></ListItem>
        <ListItem><ListItemText primary="Eval" secondary="A/B tests, red-team prompts, regression suites" /></ListItem>
      </List>

      {/* Security */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 4 }}>
        Security & Compliance
      </Typography>
      <Typography paragraph>
        Zero-trust fundamentals: mTLS everywhere, RBAC/ABAC, and policy-as-code (OPA/Gatekeeper) across clusters. Secrets are
        managed by Vault/KMS; signing and SBOMs are enforced in CI. Data is encrypted in transit and at rest.
      </Typography>
      <List dense>
        <ListItem><ListItemText primary="Tenant Isolation" secondary="Namespace, network, and data partitioning" /></ListItem>
        <ListItem><ListItemText primary="Auditability" secondary="Immutable logs, traceable decisions, export to SIEM" /></ListItem>
        <ListItem><ListItemText primary="Kill Switches" secondary="Feature flags for emergency disable/containment" /></ListItem>
      </List>

      {/* Observability */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 4 }}>
        Observability & SRE
      </Typography>
      <Typography paragraph>
        OpenTelemetry (SDK + Collector) standardizes traces, metrics, and logs across services. Metrics are scraped and stored by
        Prometheus; logs stream to Loki; and distributed traces are exported to <strong>Jaeger</strong> for analysis. Exemplars link
        high-cardinality metrics to specific trace IDs, enabling one-click pivoting from dashboards to spans.
      </Typography>
      <Typography paragraph>
        <strong>Grafana</strong> provides unified dashboards for the four golden signals (latency, traffic, errors, saturation), RED/USE
        methodologies, and SLO monitoring. Alerting integrates Grafana Alerting with Alertmanager for burn-rate policies and
        multi-signal correlation (metrics + logs + traces) to reduce noisy pages.
      </Typography>
      <Typography paragraph>
        <strong>Kiali</strong> offers a live view of the service mesh: topology graphs, request health, mTLS coverage, and traffic policies
        (retries, timeouts, canaries). It helps operators validate route rules and quickly identify failing edges or misconfigured
        destinations during rollouts.
      </Typography>
      <Typography paragraph>
        Error budgets gate releases and trigger automatic rollback when SLOs are breached. Synthetic checks and canaries run before
        full promotion; post-incident reports include timeline, contributing factors, and remediation items for continuous
        improvement.
      </Typography>

      {/* CI/CD */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 4 }}>
        CI/CD & Release Strategy
      </Typography>
      <Typography paragraph>
        GitHub Actions builds supply-chain-hardened images (SBOM, signatures) and runs tests/security scans. FluxCD deploys
        declarative manifests. Flagger manages canary/blue-green with automatic rollback on SLO breach. Database
        migrations are phased (expand-migrate-contract).
      </Typography>

      {/* Environments & DR */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 4 }}>
        Environments, Scalability & DR
      </Typography>
      <Typography paragraph>
        Ephemeral preview environments for each PR accelerate QA. Horizontal autoscaling and queue back-pressure absorb spikes.
        Multi-region replication and periodic disaster-recovery drills target strict RPO/RTO values.
      </Typography>

      {/* Quick Legend */}
      <Box sx={{ mt: 4 }}>
        <Chip label="gRPC" size="small" sx={{ mr: 1 }} />
        <Chip label="GraphQL" size="small" sx={{ mr: 1 }} />
        <Chip label="NATS" size="small" sx={{ mr: 1 }} />
        <Chip label="cloudflared" size="small" sx={{ mr: 1 }} />
        <Chip label="OpenTelemetry" size="small" sx={{ mr: 1 }} />
        <Chip label="Grafana" size="small" sx={{ mr: 1 }} />
        <Chip label="Jaeger" size="small" sx={{ mr: 1 }} />
        <Chip label="Kiali" size="small" sx={{ mr: 1 }} />
        <Chip label="FluxCD" size="small" />
      </Box>
    </Box>
  );
}
