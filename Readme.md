# Helix AI — The Autonomous Assistant Platform

[![License](https://img.shields.io/github/license/Sinless777/Helix)](https://github.com/Sinless777/Helix/blob/main/LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/Sinless777/Helix/ci.yml?branch=main)](https://github.com/Sinless777/Helix/actions)
[![Stars](https://img.shields.io/github/stars/Sinless777/Helix?style=social)](https://github.com/Sinless777/Helix)
[![Discord](https://img.shields.io/discord/1179519063312341032?label=Community&logo=discord)](https://discord.gg/UwxnkSTa7R)

Helix is an **intelligent digital companion** built for users, creators, and businesses — combining automation, contextual memory, and a secure plugin system in one extensible platform.
> “Unify your tools. Amplify your mind.”

---

## 🚀 What is Helix?

Helix is a modular AI assistant platform that unifies chat, workflows, analytics, and tools behind a secure, human-friendly interface.

- 🤖 **Virtual Assistant** — Handles tasks, answers questions, manages tools.
- 📚 **Contextual Memory** — Built-in pgvector memory with per-user context recall.
- 🔌 **Plugin Runtime** — Secure sandbox for user-created tools and automations.
- 🎛️ **Chat Interface** — Extensible UI with tool drawer, toolcalls, and conversation memory.
- 📡 **Hybrid Inference** — Route LLM calls across OpenAI, Claude, and local models.
- 📈 **Analytics Dashboards** — Personalized, shareable insights and usage graphs.
- 💬 **Discord Bot** — HelixBot combines Dyno, TicketTool, Tupperbox, and a real AI brain.
- 🌐 **Open API** — Build integrations, extend memory, trigger workflows.
- 🔒 **Zero-Trust by Design** — Signed audit logs, Vault/KMS secrets, mTLS mesh.

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

- **Frontend:** Next.js (App Router) + Tailwind + shadcn/ui
- **Backend:** Supabase + MikroORM + Redis + pgvector
- **Edge Runtime:** Cloudflare Workers, Vercel Edge Functions
- **Inference Router:** Model switching (OpenAI, Claude, Ollama)
- **Observability:** OTEL + Tempo, Loki, Grafana Cloud dashboards
- **Secrets:** Vault or HSM-backed encryption per org

> All infrastructure is GitOps-managed and multi-tenant by default.  
> Air-gapped and BYO deployments supported.

---

## 📦 Monorepo Structure

```bash
/apps
  helix-app         # Main web interface (Next.js)
  helix-api         # API routes & inference router
/packages
  db                # MikroORM entities + migrations
  sdk               # TypeScript SDK (`@helix/sdk`)
  worker            # Cloudflare Workers runtime (webhooks, automations)
  runtime           # Plugin/skill engine (Deno sandbox)
/docs
  features.md       # Full feature matrix by tier
  system-architecture.md
  integrations.md
````

---

## 🛠️ Getting Started

```bash
git clone https://github.com/Sinless777/Helix.git
cd Helix
pnpm install

# Setup env and start
cp .env.example .env
pnpm dev
```

You’ll need:

- Supabase project (with pgvector + Redis)
- Hypertune flag config
- NextAuth providers (email, Discord, GitHub)
- Stripe/PayPal keys (for B2B features)

---

## 🧪 Dev & Plugin Testing

Helix supports a plugin manifest format for external tools.

```bash
pnpm plugin run ./plugins/my-plugin.ts
```

Skills run inside a Deno sandbox with scoped permissions (`read:calendar`, `write:memory`, etc).

Use `/docs/plugin-guide.md` (coming soon) to build, sign, and test new tools.

---

## 📅 Roadmap

- ✅ Core Memory System
- ✅ Hybrid Inference Router
- ⚙️ Plugin Runtime MVP
- ⚙️ Web + Discord UI
- 🧱 Chaos Engineering Toolkit
- 🧱 IoT Edge Agent + Smart Home Control
- 🧱 Helix Linux Distro
- 🧱 Mobile App (Android/iOS)
- 🧱 Developer Marketplace (skills, plugins, integrations)

> Want to contribute or suggest features? Join our [Discord](https://discord.gg/UwxnkSTa7R)

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

