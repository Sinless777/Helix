# Helix AI — Feature Matrix (vNext)

This document outlines the major features planned for Helix AI across all tiers.  
Each feature lists its **status**, **problem solved**, **tier availability**, and **implementation plan**.

---

## Legend

| Symbol | Meaning               |
| ------ | --------------------- |
| 🧱     | Planned / Not Started |
| ⚙️     | In Development        |
| ✅     | Implemented / Stable  |

---

## Feature Overview

The matrices below group the Helix AI roadmap by capability area. Use the legend above to interpret the delivery status for each initiative.

### Core Assistant Features

| **Feature**                     | **Status**        | **Problem Solved**                                                                                                | **Tier**              | **Implementation Notes**                                                                                                                                   |
| ------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multimodal Chat Interface**   | ⚙️ In Development | Gives users a single conversational surface across text, voice, web, and Discord.                                 | Free → Enterprise     | Next.js chat surfaces with WebRTC voice, Discord and web bridge, and streaming responses; unified permissions with session hand-off across clients.        |
| **Contextual Memory System**    | ⚙️ In Development | Preserves short- and long-term context so follow-up prompts feel personal and informed.                           | All tiers             | Redis handles short-term recall, pgvector-backed `MemoryShard` stores long-term memories with retention controls, consent gating, and RAG hooks.           |
| **Hybrid Inference Router**     | ⚙️ In Development | Routes requests to the optimal model/provider (OpenAI, Claude, Ollama) for cost, latency, and capability balance. | Pro → Enterprise      | Policy-driven router with health probes, cost ceilings, and per-task fallback logic; exposes telemetry back to Model Control Plane (MCP).                  |
| **Persona Engine**              | 🧱 Planned        | Lets users and organizations define tone, behavior, and preference presets for Helix.                             | Basic+ → Enterprise   | Persona manifest schema with safety guardrails, inheritance rules, and audit history; integrates with memory consent flows.                                |
| **Tool & Skill Runtime**        | ⚙️ In Development | Safely executes sandboxed plugins so Helix can take action inside user workflows.                                 | Basic+ → Enterprise   | Deno VM isolates per execution with capability manifests, signed artifacts, and monitored resource quotas; ties into review workflow and incident logging. |
| **Natural Language Automation** | 🧱 Planned        | Converts “when X then do Y” requests into reliable automation pipelines without manual scripting.                 | Premium → Enterprise  | Workflow DSL compiled from NL prompts, trigger library (webhook/schedule/event), filter builder UI, and resilient workers with retry/backoff semantics.    |
| **Live Web Search & Scraping**  | 🧱 Planned        | Keeps Helix responses fresh by gathering and summarizing real-time web data.                                      | Premium+ → Enterprise | Cloudflare Worker crawler with sandboxed scraping, summarization via inference router, and embedding pipeline into pgvector-backed knowledge base.         |
| **Fact Tracing & Citations**    | 🧱 Planned        | Builds user trust by linking every factual answer back to verifiable sources.                                     | All paid tiers        | Response post-processor attaches citation graph nodes, renders inline references, and stores provenance for audit replay.                                  |

### User & Community Features

| **Feature**                    | **Status**        | **Problem Solved**                                                                              | **Tier**            | **Implementation Notes**                                                                                                                                  |
| ------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Discord Bot (HelixBot)**     | ⚙️ In Development | Combines moderation, tickets, persona chat, and music into one intelligent bot for communities. | Basic+ → Enterprise | Modular services for moderation, music, tickets, and AI chat share a Discord gateway; ties into automation engine and org RBAC for scoped command access. |
| **Knowledge Base Creation**    | ⚙️ In Development | Auto-builds indexed, memory-linked knowledge hubs for servers, teams, or individuals.           | All tiers           | Document ingestion pipeline with embeddings, auto-tagging to org/user memories, and review queue for sensitive content.                                   |
| **Custom Commands & Macros**   | 🧱 Planned        | Lets users or orgs define reusable commands, macros, and prompt templates.                      | Basic+ → Enterprise | Macro builder UI backed by schema-validated JSON, version history, approval flows, and sharing controls.                                                  |
| **Community Management Panel** | 🧱 Planned        | Provides a single dashboard for bans, roles, announcements, and member insights.                | Basic+ → Pro        | Next.js admin panel with analytics widgets, moderation actions, and scheduled announcements integrated with Discord and webhooks.                         |
| **Personal Dashboards**        | 🧱 Planned        | Gives users visibility into tool usage, automation runs, and memory state.                      | Free → Enterprise   | Configurable dashboard powered by Supabase/Postgres views, Grafana embeds, and privacy controls for shared views.                                         |
| **Multi-language Support**     | 🧱 Planned        | Enables end-to-end multilingual experiences in UI and inference.                                | All tiers           | Automatic locale negotiation, translation middleware leveraging inference router, and localized UI copy via Hypertune feature flags.                      |

### Developer & Plugin Features

| **Feature**                         | **Status**        | **Problem Solved**                                                                            | **Tier**            | **Implementation Notes**                                                                                                                   |
| ----------------------------------- | ----------------- | --------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Open Plugin API**                 | ⚙️ In Development | Allows external developers to integrate Helix capabilities programmatically.                  | Basic+ → Enterprise | REST + GraphQL surface with scoped API tokens, manifest validation, webhook callbacks, and rate-limited execution.                         |
| **Scoped Memory Access**            | 🧱 Planned        | Ensures plugins can only touch the memories they are authorized to view.                      | Basic+ → Enterprise | Memory access policies enforced via ABAC, per-request audit logging, and consent prompts for sensitive scopes.                             |
| **Trigger-based Automation Engine** | 🧱 Planned        | Lets developers wire triggers, filters, and actions into Helix without custom infrastructure. | Pro → Enterprise    | Event bus abstraction (Kafka/NATS) with workflow composer, replay support, and retry/backoff semantics exposed via UI and SDK.             |
| **Skill Marketplace**               | 🧱 Planned        | Provides discovery, review, and distribution for community-built automations and skills.      | Basic+ → Enterprise | Marketplace service with submission review queue, rating system, signed bundles, and usage analytics for creators.                         |
| **Helix SDK**                       | ⚙️ In Development | Simplifies integration through TypeScript, Python, and REST clients.                          | All paid tiers      | `@helix/sdk`, Python client, and OpenAPI definitions kept in sync via CI; includes auth helpers, test harnesses, and example integrations. |
| **CLI Tools (`helixctl`)**          | ⚙️ In Development | Supports local dev, packaging, and air-gapped deployment workflows.                           | Pro → Enterprise    | Deno/Node CLI for scaffolding skills, running integration tests, packaging offline bundles, and managing deployments via API.              |

### Analytics & Observability

| **Feature**                 | **Status**        | **Problem Solved**                                                                    | **Tier**                 | **Implementation Notes**                                                                                                                |
| --------------------------- | ----------------- | ------------------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Usage & Token Meters**    | ⚙️ In Development | Gives organizations visibility into consumption for billing and capacity planning.    | Pro → Enterprise         | Metering pipeline captures per-request tokens, latency, and cost; exports to billing engine and personal dashboards.                    |
| **Audit Logging**           | 🧱 Planned        | Provides tamper-evident trails for compliance and security investigations.            | Pro → Enterprise         | Append-only, signed logs persisted in object storage with SIEM export, retention policies, and query tooling.                           |
| **Grafana Dashboards**      | ⚙️ In Development | Centralizes latency, skill failure, vector recall, and API usage insights.            | Enterprise + Internal    | Managed Grafana stack with Tempo/Loki/Mimir data sources, SLO dashboards, and alert routing via Grafana OnCall.                         |
| **Feature Flag Resolution** | ⚙️ In Development | Enables targeted experiments and customer-specific feature toggles through Hypertune. | All tiers (configurable) | Hypertune-backed rollout rules, per-org overrides, and audit logs; integrates with web app and automation engine for runtime decisions. |
| **OTEL Instrumentation**    | ⚙️ In Development | Unifies tracing, metrics, logs, and profiles for the Helix platform.                  | Internal                 | OpenTelemetry collector fleet exports to Tempo, Mimir, and third-party sinks; includes sampling strategy and redaction policies.        |

### Security & Privacy

| **Feature**                            | **Status**        | **Problem Solved**                                                                      | **Tier**              | **Implementation Notes**                                                                                                                   |
| -------------------------------------- | ----------------- | --------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Zero-Trust Architecture**            | 🧱 Planned        | Ensures every service identity and connection is mutually authenticated and authorized. | Pro → Enterprise      | SPIFFE/SPIRE identity issuance, mTLS mesh, periodic certificate rotation, and least-privilege policies enforced via service mesh.          |
| **Memory Redaction & Review Controls** | 🧱 Planned        | Prevents sensitive data from persisting without human approval.                         | Premium → Enterprise  | Redaction pipelines with PII detection, reviewer queues, and retention policies configurable per tenant.                                   |
| **Per-Tenant Secret Isolation**        | 🧱 Planned        | Keeps credentials and API keys isolated across tenants.                                 | Pro → Enterprise      | Vault/KMS-backed secret storage with envelope encryption, access logs, and automated rotation hooks.                                       |
| **RBAC & ABAC Policy Engine**          | ⚙️ In Development | Governs role-based and attribute-based access for every surface.                        | All paid tiers        | Policy engine built on OPA/Rego with organization/group hierarchies, session enforcement, and audit trails shared with compliance tooling. |
| **Compliant Modes (SOC2/HIPAA/GDPR)**  | 🧱 Planned        | Enables regulated customers to enforce stricter data handling and auditing standards.   | Enterprise            | Configuration bundles for logging, retention, encryption, and incident workflows aligned with SOC2, HIPAA, and GDPR requirements.          |
| **Chaos Engineering Mode**             | 🧱 Planned        | Validates resilience of plugins, inference, and infrastructure under failure scenarios. | Premium+ → Enterprise | Fault injection service, staged experiment library, and runbook automation with rollback hooks and outcome dashboards.                     |

### Platform & Deployment

| **Feature**                    | **Status**        | **Problem Solved**                                                                 | **Tier**              | **Implementation Notes**                                                                                                                    |
| ------------------------------ | ----------------- | ---------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Helix Web App**              | ⚙️ In Development | Delivers the primary web experience for managing chat, automations, and analytics. | All tiers             | Next.js + shadcn/ui front-end with app router, SSR streaming, and shared component library; integrates with Hypertune for feature flagging. |
| **Discord Integration**        | ⚙️ In Development | Embeds Helix experiences directly inside Discord servers and DMs.                  | Free → Enterprise     | Slash commands, context menus, and webhook bridges share authentication with HelixBot modules and respect org RBAC scopes.                  |
| **Android/iOS App**            | 🧱 Planned        | Extends Helix to mobile notifications, voice input, and device sync.               | Free → Pro            | React Native / Expo application with offline cache, push notifications, biometric auth, and deep links back to automations and dashboards.  |
| **Helix Linux Distro**         | 🧱 Planned        | Offers a privacy-first desktop with Helix as the native system assistant.          | Premium+ → Enterprise | Debian-based distro packaged with Helix CLI, local Ollama/LLAMA runtimes, secure telemetry opt-in, and automated updates via Flatpak.       |
| **IoT Agent Support**          | 🧱 Planned        | Connects Helix automations to smart home and device networks.                      | Premium+ → Enterprise | Device twin service with MQTT/Zigbee bridges, rules engine integration, and Grafana-powered device health monitoring.                       |
| **Air-Gapped Deployment Mode** | 🧱 Planned        | Enables fully offline, self-hosted deployments for high-security environments.     | Enterprise            | BYO Postgres/Redis packaging, artifact signing, offline model caches, and `helixctl` workflows for updates without external connectivity.   |

---

## GA Core Platform Foundations (v1.0)

These roadmap items define the minimum feature surface required for the General Availability milestone. Grouping the work keeps cross-team coordination focused and aligns delivery sequencing.

| Theme                     | Focus                                                                          | Linked Issues                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Authentication & Identity | Establish shared auth service, session payloads, and multi-provider linking.   | [#151](https://github.com/Sinless777/Helix/issues/151), [#152](https://github.com/Sinless777/Helix/issues/152) |
| Context Intelligence      | Build the context engine that fuses memory, telemetry, and retention controls. | [#153](https://github.com/Sinless777/Helix/issues/153)                                                         |
| Security & Policy         | Deliver zero-trust policy evaluation and signed audit logging.                 | [#154](https://github.com/Sinless777/Helix/issues/154)                                                         |
| Plugin Ecosystem          | Stand up the sandbox runtime and lifecycle management for third-party skills.  | [#155](https://github.com/Sinless777/Helix/issues/155)                                                         |
| Developer Surface         | Ship the TypeScript SDK and CLI to expose Helix capabilities programmatically. | [#156](https://github.com/Sinless777/Helix/issues/156), [#157](https://github.com/Sinless777/Helix/issues/157) |

### Delivery Checklist

- Auth flows and account linking documented with environment setup for contributors (issues [#151](https://github.com/Sinless777/Helix/issues/151) and [#152](https://github.com/Sinless777/Helix/issues/152)).
- Context engine contracts reviewed by AI and platform teams prior to SDK wiring (issue [#153](https://github.com/Sinless777/Helix/issues/153)).
- Security engine test harness and audit pipelines validated before plugin runtime launch (issue [#154](https://github.com/Sinless777/Helix/issues/154)).
- Plugin runtime, SDK, and CLI roadmaps remain in lockstep so developer tooling reflects the same permission model (issues [#155](https://github.com/Sinless777/Helix/issues/155), [#156](https://github.com/Sinless777/Helix/issues/156), and [#157](https://github.com/Sinless777/Helix/issues/157)).

> Keeping these threads synchronized ensures GA customers receive a coherent experience across authentication, policy enforcement, and developer tooling.

## Tier Distribution Summary

| **Tier**       | **Focus**                    | **Included Features**                                                                                 |
| -------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Free**       | Entry-level assistant & chat | Multimodal chat interface, contextual memory (lite), personal dashboards (starter), DevLog access     |
| **Basic**      | Personal use                 | Persona engine presets, custom commands/macros, Discord integration (lite), knowledge base viewer     |
| **Basic+**     | Power users & creators       | Full HelixBot suite, knowledge base creation, tool & skill runtime access, community management panel |
| **Premium**    | Advanced companion           | Natural language automation, security insights, API integrations, multilingual support                |
| **Premium+**   | Developer / Prosumer         | IoT agent support, live web search & scraping, Linux distro integration, advanced memory controls     |
| **Pro**        | Small business / teams       | Hybrid inference router, open plugin API, scoped memory access, usage and token meters                |
| **Enterprise** | Large-scale organizations    | Air-gapped deployment, zero-trust architecture, audit logging & OTEL dashboards, governance toolkit   |

---

_© SinLess Games LLC / Helix AI Project — Internal Product Spec_
