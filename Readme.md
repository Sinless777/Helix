# Helix AI — The Autonomous Assistant Platform

<!-- markdownlint-disable MD033 -->
<p align="center">
  <img src="https://cdn.sinlessgamesllc.com/Helix-AI/images/Helix_Logo.png" alt="Helix AI Logo" width="260" />
</p>
<p align="center"><strong>Automation-grade AI copilots for teams, creators, and businesses.</strong></p>
<p align="center">
  <strong>Project Pulse</strong><br />
  <a href="https://github.com/Sinless777/Helix/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/Sinless777/Helix?style=for-the-badge" alt="License: Polyform" />
  </a>
  <a href="https://github.com/Sinless777/Helix/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/Sinless777/Helix/ci.yml?branch=main&style=for-the-badge" alt="Build Status" />
  </a>
  <a href="https://github.com/Sinless777/Helix">
    <img src="https://img.shields.io/github/stars/Sinless777/Helix?style=for-the-badge" alt="GitHub Stars" />
  </a>
</p>
<p align="center">
  <strong>Momentum</strong><br />
  <a href="https://github.com/Sinless777/Helix/issues">
    <img src="https://img.shields.io/github/issues/Sinless777/Helix?style=for-the-badge" alt="GitHub Issues" />
  </a>
  <a href="https://github.com/Sinless777/Helix/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/Sinless777/Helix?style=for-the-badge" alt="Contributors" />
  </a>
  <a href="https://github.com/Sinless777/Helix/commits/main">
    <img src="https://img.shields.io/github/commit-activity/m/Sinless777/Helix?style=for-the-badge" alt="Commit Activity" />
  </a>
</p>
<p align="center">
  <strong>Community</strong><br />
  <a href="https://discord.gg/Za8MVstYnr">
    <img src="https://img.shields.io/discord/1070973491379191818?label=Community&logo=discord&style=for-the-badge" alt="Join the Discord Community" />
  </a>
  <a href="https://github.com/Sinless777/Helix/blob/main/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-Welcome-ff69b4?style=for-the-badge&logo=github" alt="PRs Welcome" />
  </a>
</p>
<!-- markdownlint-enable MD033 -->

Helix is an **intelligent digital companion** built for users, creators, and businesses — combining automation, contextual memory, and a secure plugin system in one extensible platform.

> “Unify your tools. Amplify your mind.”

---

## 🚀 What is Helix?

**Helix is a modular AI assistant platform designed to unify your tools, workflows, and intelligence into a single, secure, human-friendly experience.**

Unlike traditional assistants or bots, Helix is built as a full-stack system that spans chat interfaces, automation, memory, observability, and secure plugin execution. It adapts to each user or organization with contextual awareness, intelligent orchestration, and powerful extensibility — across web, Discord, mobile, and even the OS level.

Helix isn't just reactive — it's proactive, modular, programmable, and privacy-conscious.

---

### 🧠 🤖 Virtual Assistant

Helix serves as a natural-language assistant that can **answer questions, manage workflows, run automations, and execute commands across your connected tools**. It understands user intent, tracks goals, and provides reasoning with memory and persona context — not just static answers.

---

### 🧠 📚 Contextual Memory

Powered by **pgvector** and long-term embedding memory, Helix tracks context per user, conversation, tool, and organization. It remembers what matters — conversations, facts, files, decisions — and lets you query or forget them at will. Think of it as a second brain with search and TTL.

---

### 🔌 Plugin Runtime

Helix introduces a **secure sandboxed runtime** for custom tools, automations, and third-party extensions. Developers can publish skills using signed manifests, and users can run tools with explicit scopes like `read:calendar` or `write:memory`. This bridges the gap between assistant and operating system.

---

### 🎛️ Chat Interface

Helix’s UI is built to **streamline how users interact with AI, memory, and tools**. Features include a plugin drawer, toolcall inspection, persistent conversations, personas, and live updates. Whether via web, mobile, or Discord — the experience is consistent, assistive, and extensible.

---

### 📡 Hybrid Inference

Helix can route tasks dynamically across multiple model providers: OpenAI, Claude, Ollama (local), and fine-tuned internal models. This lets users choose between performance, privacy, and cost — all controlled by tier, policy, or inference health. It’s an intelligent LLM load balancer and policy enforcer in one.

---

### 📈 Analytics Dashboards

Users and orgs can view **personalized dashboards with memory usage, plugin activity, skill latency, and AI model performance**. These dashboards are powered by OTEL and Grafana, and support annotations, sharing, and custom metrics per tenant.

---

### 💬 Discord Bot

HelixBot brings the full assistant experience to Discord — combining **Dyno moderation**, **TicketTool**, **Tupperbox**, and **AI agent capabilities**. Users can create tickets, assign skills, run commands, or collaborate with Helix directly inside their communities.

---

### 🌐 Open API & SDK

Every part of Helix is accessible via its **open API and TypeScript SDK** (`@helix/sdk`). Developers can integrate memory, skill runs, automations, or chat experiences into their own tools, allowing Helix to act as a platform, not just a product.

---

### 🔒 Zero-Trust by Design

Helix is engineered with enterprise-grade security from the start:

- **Per-tenant secrets** stored via Vault/KMS
- **mTLS mesh** for edge and plugin traffic
- **Signed Audit Logs** (Ed25519)
- **RBAC/ABAC** controls for every tool and API
- **Air-gapped deployment support** for compliance environments (SOC2, HIPAA, GDPR)

---

**In short:** Helix is not just another assistant — it’s a full-stack, programmable, privacy-first, user-centric AI operating system that runs anywhere: browser, Discord, mobile, or serverless edge.

---

## 🧠 Features

| Type          | Highlights                                                                 |
| ------------- | -------------------------------------------------------------------------- |
| Memory        | Short-term (Redis) + long-term (pgvector) with embedded provenance         |
| Skills        | Deno sandboxed plugin runtime with signed manifests and scoped permissions |
| Automations   | Triggers → Filters → Actions (webhooks, schedules, events)                 |
| Security      | RBAC/ABAC, per-tenant secrets, audit logs (Ed25519 signed)                 |
| Observability | OTEL tracing, Grafana dashboards, k6 load tests, Chaos mode                |
| Chat UI       | Multimodal assistant with persona overlays, memory viewer, skill drawer    |
| API           | Open REST API + TypeScript SDK (`@helix/sdk`)                              |
| Integrations  | Discord, Stripe, GitHub, Google, Slack, Notion, and more (via marketplace) |

---

## 🏗️ Architecture Overview

Helix is built on a **modular, secure, multi-tenant architecture** designed to scale across personal devices, cloud workloads, and enterprise environments — including fully **air-gapped deployments**.

---

### 💻 Frontend

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Components)
- **Styling:** TailwindCSS + [shadcn/ui](https://ui.shadcn.com/) for clean, component-driven UI
- **Modes:** Web app, Discord bot UI, upcoming mobile (React Native)
- **UX Architecture:** Chat interface + plugin drawer + memory viewer + dashboard panels

---

### 🔧 Backend Core

- **Database:** [Supabase](https://supabase.com/) (Postgres + Realtime + Auth)
- **ORM:** [MikroORM](https://mikro-orm.io/) for schema-driven, typesafe Postgres modeling
- **Cache & Queues:** Redis (short-term memory, task queues, session context)
- **Vector Memory:** pgvector (HNSW/IVFFlat) for long-term memory & context embeddings

---

### ⚙️ Inference & Intelligence

- **Router:** Model control plane routes inference requests across providers based on cost, latency, org policy
- **Supported Models:**

  - `openai:gpt-4`, `openai:gpt-3.5-turbo`
  - `claude-3-opus` / `claude-3-sonnet`
  - `ollama:llama3-70b`, `mistral`, custom fine-tunes

- **Fallback Logic:** Retry-on-failure, tier-aware switches, hybrid local/cloud override

---

### 🌍 Edge Runtime

- **Primary Edge:** [Cloudflare Workers](https://developers.cloudflare.com/workers/) (webhooks, automations, inference)
- **UI Delivery:** Vercel Edge Functions + CDN
- **Chaos Ready:** Workers are instrumented for chaos testing (latency spikes, plugin sandbox failures)

---

### 🔐 Secrets & Isolation

- **Secrets Backend:** Vault, AWS KMS, or on-prem HSM per tenant/org
- **Audit Trails:** Append-only audit logs (Ed25519-signed)
- **Plugin Isolation:** Each skill/tool runs in a Deno sandbox with scope-limited memory and access
- **RBAC/ABAC:** Fully enforced at plugin, API, memory, and automation layers

---

### 📊 Observability & Monitoring

- **Tracing:** OpenTelemetry (OTEL)
- **Dashboards:** [Grafana Cloud](https://grafana.com/), with panels for:

  - Skill execution latency
  - Plugin failures
  - Memory recall precision
  - Usage metrics per org/user/tier

- **Telemetry Stack:**

  - `Tempo` for traces
  - `Loki` for logs
  - `Mimir` for metrics
  - `Pyroscope` for CPU profiles
  - `k6` for load testing
  - `Alertmanager` for incident ops

---

### 🔁 DevOps & Infra

- **Deployment:** GitOps-based (GitHub Actions → Vercel + Cloudflare deploys)
- **Multi-Tenant Support:**

  - Per-org data isolation
  - Custom memory scopes (`org|user|tool|conversation`)

- **Air-Gapped Mode:**

  - BYO Postgres, Redis, KMS, Workers
  - No public SaaS dependencies
  - CLI-based provisioning via `helixctl` (WIP)

---

### 📦 Extensibility

- **Plugin Runtime:** Deno VM, signed manifest, permissions + review queue
- **Automation Engine:** Trigger (event/webhook/schedule) → Filter → Action (tool/skill/memory)
- **SDKs:**

  - TypeScript: `@helix/sdk`
  - Python (beta)
  - REST API (OpenAPI Spec WIP)

- **Marketplace:** Users and orgs can install 3rd-party tools securely

---

## 📦 Monorepo Structure

```bash
/apps
  frontend            # App Router UI with Tailwind + shadcn/ui
  frontend-e2e        # Cypress smoke + regression specs for the UI
  services/
    user              # NestJS user/domain service (auth, accounts, org graph)
    user-e2e          # Jest e2e targets for the user service
/libs
  config              # Runtime config objects, secrets, telemetry helpers
  db                  # MikroORM entities, repositories, and base models
  hypertune           # Hypertune feature-flag client + React bindings
  ui                  # Shared component system, providers, and theme tokens
/Docs
  Features.md         # Product tiers and capabilities
  DEPLOY.md           # Deployment notes and cloud prerequisites
  ThirdParty.md       # Vendor/third-party integration references
  observability/ga-plan.md # Canonical Observability GA rollout plan
```

---

## 🧪 Dev & Plugin Testing

Helix supports a plugin manifest format for external tools.

```bash
pnpm plugin run ./plugins/my-plugin.ts
```

Skills run inside a Deno sandbox with scoped permissions (`read:calendar`, `write:memory`, etc).

Use `/docs/plugin-guide.md` (coming soon) to build, sign, and test new tools.

---

| ✅ / ⚙️ / 🧱 | Milestone                               | Description                                                                                                                                                                                                   |
| ------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ⚙️           | **Core Memory System**                  | Implemented contextual memory with Redis (short-term) and `pgvector`-backed long-term embeddings, organized by `MemorySpace` and `MemoryShard`. Includes time-bounded retention and persona-aware recall.     |
| ⚙️           | **Hybrid Inference Router**             | Fully operational routing layer that dynamically switches between OpenAI, Claude, and Ollama/local models. Supports fallback logic, model policy enforcement, and latency- or tier-based switching.           |
| ⚙️           | **Plugin Runtime MVP**                  | Sandbox-ready Deno VM to run signed tools with manifest-defined permissions. Current focus: execution tracing, audit logs, scoped memory access. Used for skills like “schedule.post”, “summarize.page”, etc. |
| ⚙️           | **Web + Discord UI**                    | Unified assistant interface across web (Next.js + shadcn/ui) and Discord (`HelixBot`) with support for chat, memory inspection, tool drawer, personas, and message context.                                   |
| 🧱           | **Chaos Engineering Toolkit**           | Controlled failure injection for memory, inference, automations, and plugin runtime. Includes OTEL-backed observability, rollback hooks, and pre-prod harness. Will support `chaos_mode_enabled` flag.        |
| 🧱           | **IoT Edge Agent + Smart Home Control** | MQTT/Zigbee-capable `Agent` model with support for edge heartbeat, command dispatch, and state sync. Helix will control devices via text or scheduled automations.                                            |
| 🧱           | **Helix Linux Distro**                  | Privacy-first Linux environment with Helix as the core AI assistant. Includes native CLI (`helixctl`), voice activation, secure local inference, and offline plugin support.                                  |
| 🧱           | **Mobile App (Android/iOS)**            | React Native-based assistant interface with chat, notifications, memory sync, and voice input. Will support offline caching, push messaging, and native intents.                                              |
| 🧱           | **Developer Marketplace**               | Plugin marketplace where creators can submit, review, and share skills, integrations, and workflows. Includes signed manifest submission, sandbox tests, and scoped install UI.                               |

---

## 🤝 Contributing

Pull requests, issues, and contributions are welcome! Please follow the [Contributor Guidelines](./CONTRIBUTING.md) and review the [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## 📜 License

[Polyform Noncommercial License 1.0.0](./LICENSE.md) © SinLess Games LLC

Helix is a source-available platform. Noncommercial use is permitted under the Polyform license.  
Commercial use, resale, or sublicensing requires a separate license from [helixaibot.com](https://helixaibot.com).

---

Made with ❤️ by [@Sinless777](https://github.com/Sinless777) and contributors
