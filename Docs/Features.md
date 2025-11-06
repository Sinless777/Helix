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

| **Feature**                            | **Status**          | **Problem Solved**                                                                                                                     | **Tier**                    | **Implementation Notes**                                                                                                                                               |
| -------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Discord Bot Platform (HelixBot)**    | 🧱 Planned         | Unifies moderation, music, tickets, and virtual assistant into one intelligent bot (Dyno + ProBot + TupperBot + TicketBot + MusicBot). | Basic+ → Enterprise         | Built on Helix Core + Discord SDK. Modular microservices (Moderation, Music, Tickets, Personality, Analytics). Integrates with `Automation` and `Conversation` models. |
| **Virtual Assistant (Helix Core AI)**  | ⚙️ In Development | Provides companion/assistant capabilities across chat, terminal, mobile, and OS.                                                       | All tiers (limited in Free) | Uses GPT-based inference router; integrates `MemoryShard` + context knowledge base. Supports persona customization and voice/visual input.                             |
| **Chat Interface with Tools**          | ⚙️ In Development | Centralized chat interface for managing AI, automations, and tools.                                                                    | Free → Enterprise           | Built with Next.js + shadcn/ui. Integrates with Plugins/Skills runtime. Tool access governed by RBAC/ABAC.                                                             |
| **B2B Platform (Helix Enterprise)**    | 🧱 Planned         | Enables teams, organizations, and businesses to deploy private Helix instances.                                                        | Pro → Enterprise            | Includes org membership, RBAC, usage metering, SSO, billing, and audit logs. Runs on multi-tenant Supabase cluster.                                                    |
| **B2C Companion Platform**             | ⚙️ In Development | Provides personal assistant & productivity tools to individual users.                                                                  | Free → Premium              | Connects to Discord, mobile app, and Linux distro; leverages contextual memory.                                                                                        |
| **Helix Linux Distro**                 | 🧱 Planned         | Builds a self-contained, privacy-first OS with Helix as the system AI.                                                                 | Premium+ → Enterprise       | Based on Debian/Arch. Includes native Helix CLI, voice assistant, secure telemetry, and local Ollama inference.                                                        |
| **Android App (Helix Mobile)**         | 🧱 Planned         | Gives users mobile access to Helix chat, notifications, and device sync.                                                               | Free → Pro                  | Built with React Native / Expo. Integrates notifications, voice input, and local cache for offline mode.                                                               |
| **IoT Management Hub**                 | 🧱 Planned         | Connects, monitors, and manages IoT devices via MQTT/Zigbee/HTTP.                                                                      | Premium+ → Enterprise       | Uses `Device` and `Agent` entities. Includes rules engine, device twins, and alerting. Integrates with Grafana & Alertmanager.                                         |
| **Automated Security & Risk Analysis** | 🧱 Planned         | Analyzes user systems for vulnerabilities and produces security reports.                                                               | Premium → Enterprise        | Uses on-device scanners + backend correlator (Falco/Wazuh). Generates reports to user dashboard.                                                                       |
| **Community Management for Creators**  | 🧱 Planned         | Helps content creators manage Discord, Patreon, Substack, etc.                                                                         | Basic+ → Pro                | Integrates Discord APIs, Patreon, YouTube, and Twitch analytics. Adds scheduling and community insights dashboard.                                                     |
| **Open API & API Tokens**              | ⚙️ In Development | Allows developers and partners to integrate Helix services securely.                                                                   | All paid tiers              | `ApiKey` + `IntegrationTemplate` schema support. Token scopes, revocation, and audit logging enabled.                                                                  |
| **Contextual Knowledge Base**          | ⚙️ In Development | Maintains structured, persistent knowledge about user, org, and domain context.                                                        | All tiers                   | Built on `MemorySpace` and `MemoryShard` with pgvector embeddings. Enables contextual reasoning and recall.                                                            |
| **Web Scraper & Indexer**              | 🧱 Planned         | Allows Helix to autonomously gather and index information from the web.                                                                | Premium+ → Enterprise       | Uses Puppeteer/Cheerio-based scraper via Cloudflare Workers; stores embeddings in pgvector.                                                                            |
| **MCP (Model Control Plane)**          | 🧱 Planned         | Enables centralized management of AI models, routes, and providers.                                                                    | Pro → Enterprise            | Defines model registry, routing policy, telemetry, and cost tracking per provider.                                                                                     |
| **Automated News Page (Helix Pulse)**  | 🧱 Planned         | Curates AI-driven news and changelogs from Helix ecosystem.                                                                            | Free → Pro                  | Pulls from RSS, GitHub releases, and internal event logs. Auto-posts via CMS or API.                                                                                   |
| **Developer Blog (Helix DevLog)**      | 🧱 Planned         | Transparent communication of updates and developer insights.                                                                           | All tiers                   | Integrates with CMS (Contentful). Auto-deploys via GitHub Actions and Vercel.                                                                                          |
| **Custom Tools / Skills API**          | ⚙️ In Development | Lets developers register and publish custom tools/skills for Helix.                                                                    | Basic+ → Enterprise         | Built on `IntegrationTemplate` + sandboxed Deno runtime. Uses review queue + manifest signing.                                                                         |

---

## Tier Distribution Summary

| **Tier**       | **Focus**                    | **Included Features**                                                           |
| -------------- | ---------------------------- | ------------------------------------------------------------------------------- |
| **Free**       | Entry-level assistant & chat | Chat interface, limited assistant, API tokens (read-only), DevLog access        |
| **Basic**      | Personal use                 | Virtual assistant, tool access, Discord integration (lite), analytics dashboard |
| **Basic+**     | Power users & creators       | Full Discord bot suite, community management, custom tools, memory persistence  |
| **Premium**    | Advanced companion           | Automated security analysis, API integrations, personalization, IoT basic       |
| **Premium+**   | Developer / Prosumer         | IoT management, web scrapers, Linux distro integration, advanced memory         |
| **Pro**        | Small business / teams       | B2B platform, MCP, org-level RBAC, hybrid inference, billing integration        |
| **Enterprise** | Large-scale organizations    | Air-gapped mode, multi-org control, audit, telemetry, governance, IoT fleet ops |

---

## Implementation Notes

- **Priority 1 (In Progress)**: Virtual Assistant, Chat Interface, Contextual Knowledge Base, Open API, Custom Skills API.
- **Priority 2 (Next)**: Discord Bot Suite, B2C/B2B Launch, Automated Security, Developer Blog.
- **Priority 3 (Later)**: IoT, MCP, Linux Distro, Web Scraper, News Portal.

---

## Roadmap Summary (2025–2026)

| Quarter     | Milestones                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------ |
| **Q1 2025** | Finalize Helix Core AI, Memory System, and Chat Interface.                                       |
| **Q2 2025** | Launch HelixBot (Discord), add Custom Skills API + B2C platform.                                 |
| **Q3 2025** | Add IoT agent, Security Reports, Community Tools, and Open API v1.                               |
| **Q4 2025** | Begin MCP rollout, Helix Pulse (News), and Linux Distro Alpha.                                   |
| **2026+**   | Expand into B2B/Enterprise, air-gapped deployments, on-device inference, full IoT orchestration. |

---

*© SinLess Games LLC / Helix AI Project — Internal Product Spec*

