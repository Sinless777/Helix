// user-interfaces/frontend/src/constants/Docs/roadmap.ts

export interface Task {
  id: number
  title: string
  description: string
  status: 'not-started' | 'in-progress' | 'completed'
  assigned_to?: string
  due_date?: string
  completion_date?: string // i.e. January 1983
}

export interface Phase {
  phase: number | string
  title: string
  description: string
  time_frame: string
  status: 'not-started' | 'in-progress' | 'completed'
  tasks: Task[]
  completion_date?: string
}

// Example roadmap data (you can expand or modify as needed)
export const RoadmapPhases: Phase[] = [
  {
    phase: 1,
    title: 'Core Architecture Bootstrapping',
    description:
      'Set up CI/CD, secrets management, basic service scaffolds, and observability stack.',
    time_frame: 'october 2025',
    status: 'in-progress',
    tasks: [
      {
        id: 1,
        title: 'Initialize GitHub Actions pipeline',
        description:
          'Configure semantic version gating, test/lint/build stages.',
        status: 'in-progress',
        assigned_to: 'Timothy Pierce',
        due_date: '2025-08-10',
      },
      {
        id: 2,
        title: 'Set up Vault + SOPS secrets integration',
        description: 'Securely manage secrets via GitOps-safe encryption.',
        status: 'not-started',
        assigned_to: 'Timothy Pierce',
        due_date: '2025-08-15',
      },
      {
        id: 3,
        title: 'Provision Prometheus + Grafana dashboards',
        description:
          'Deploy metrics stack with initial service-level SLO views.',
        status: 'not-started',
        assigned_to: 'Timothy Pierce',
        due_date: '2025-08-30',
      },
      {
        id: 4,
        title: 'Set up Loki + Fluentbit log pipeline',
        description:
          'Structured logging with searchable, filtered access per microservice.',
        status: 'not-started',
        due_date: '2025-09-10',
      },
      {
        id: 5,
        title: 'Deploy Tempo + Jaeger tracing',
        description:
          'Instrument core services for distributed tracing support.',
        status: 'not-started',
        due_date: '2025-09-20',
      },
      {
        id: 6,
        title: 'Create Helm charts for baseline services',
        description:
          'Create reusable Helm charts for Grafana, Prometheus, Loki, Tempo, and Vault.',
        status: 'not-started',
        due_date: '2025-09-25',
      },
      {
        id: 7,
        title: 'Build base NestJS microservice scaffold',
        description:
          'Includes OpenAPI generation, DTO validation, RBAC hooks, and tracing stubs.',
        status: 'not-started',
        due_date: '2025-10-01',
      },
      {
        id: 8,
        title: 'Build base FastAPI scaffold for Python services',
        description:
          'Async-ready scaffold with Sentry, metrics, pydantic schemas, and JWT guard middleware.',
        status: 'not-started',
        due_date: '2025-10-08',
      },
      {
        id: 9,
        title: 'Establish centralized config loader (Vault-backed)',
        description:
          'Support dynamic config reload and encrypted secret mounts.',
        status: 'not-started',
        due_date: '2025-10-15',
      },
      {
        id: 10,
        title: 'Set up RKE2 Kubernetes cluster',
        description:
          'Provision dev environment with Rancher or kubeadm-managed RKE2 + containerd.',
        status: 'not-started',
        due_date: '2025-10-22',
      },
      {
        id: 11,
        title: 'Install Istio service mesh with mTLS',
        description:
          'Add zero-trust, in-cluster security and service discovery features.',
        status: 'not-started',
        due_date: '2025-11-01',
      },
      {
        id: 12,
        title: 'Set up KrakenD API gateway with autoscaling',
        description:
          'Route service traffic through KrakenD with retries and circuit breakers.',
        status: 'not-started',
        due_date: '2025-11-10',
      },
      {
        id: 13,
        title: 'Configure ExternalDNS + cert-manager',
        description:
          'Automatic DNS record creation and TLS cert issuance per ingress.',
        status: 'not-started',
        due_date: '2025-11-17',
      },
      {
        id: 14,
        title: 'Deploy basic alerting stack (PrometheusRule + Discord webhook)',
        description:
          'Alerting via Grafana + Prometheus + routed to Discord channel.',
        status: 'not-started',
        due_date: '2025-11-24',
      },
      {
        id: 15,
        title: 'Write IaC (Terraform + Ansible) for infra reproducibility',
        description:
          'Provision infra in dev/staging using codified templates and secure roles.',
        status: 'not-started',
        due_date: '2025-12-01',
      },
      {
        id: 16,
        title: 'Implement GitOps delivery via FluxCD',
        description:
          'Sync cluster state from Git repo using Flux for declarative deploys.',
        status: 'not-started',
        due_date: '2025-12-08',
      },
      {
        id: 17,
        title: 'Perform initial chaos test with Chaos Mesh',
        description:
          'Run resilience tests (latency, pod kill, DNS drop) and measure SLO tolerance.',
        status: 'not-started',
        due_date: '2025-12-15',
      },
      {
        id: 18,
        title: 'Conduct security scan with Falco + CrowdSec',
        description: 'Enable runtime threat detection and alerting in RKE2.',
        status: 'not-started',
        due_date: '2025-12-22',
      },
      {
        id: 19,
        title: 'Document architecture + bootstrapping guide',
        description:
          'Create high-level diagrams and reproducible setup scripts for onboarding.',
        status: 'not-started',
        due_date: '2025-12-31',
      },
    ],
  },
  {
    phase: 2,
    title: 'Discord Bot MVP',
    description:
      'Deliver modular, RBAC-secured Discord bot core with mod tools and ticketing.',
    time_frame: 'January 2026',
    status: 'not-started',
    tasks: [
      {
        id: 4,
        title: 'Build mod-logs and moderation tools',
        description:
          'Includes auto-moderation, role escalations, and logs export.',
        status: 'not-started',
        due_date: '2026-01-20',
        assigned_to: 'Timothy Pierce',
      },
      {
        id: 5,
        title: 'Implement ticketing system with slash commands',
        description:
          'Enable private thread creation, tagging, and audit trail.',
        status: 'not-started',
        due_date: '2026-01-31',
        assigned_to: 'Timothy Pierce',
      },
      {
        id: 6,
        title: 'Integrate Discord OAuth2 and role-based access',
        description:
          'Enable login and bot control access via Discord roles and permissions.',
        status: 'not-started',
        due_date: '2026-02-10',
      },
      {
        id: 7,
        title: 'Implement command router with permissions',
        description:
          'Centralized slash command registration with per-role gating and cooldowns.',
        status: 'not-started',
        due_date: '2026-02-18',
      },
      {
        id: 8,
        title: 'Add support for mod notes and user history',
        description:
          'Persistent storage and UI for viewing mod actions per user.',
        status: 'not-started',
        due_date: '2026-02-28',
      },
      {
        id: 9,
        title: 'Deploy RBAC module via backend sync',
        description:
          'Use centralized RBAC definitions synced to Discord commands.',
        status: 'not-started',
        due_date: '2026-03-05',
      },
      {
        id: 10,
        title: 'Build interactive punishment workflow (buttons/menus)',
        description:
          'Enable structured actions (mute, warn, ban) via UI components.',
        status: 'not-started',
        due_date: '2026-03-15',
      },
      {
        id: 11,
        title: 'Implement audit trail logging and webhook sync',
        description:
          'Persist all admin/mod actions and notify a dedicated logs channel.',
        status: 'not-started',
        due_date: '2026-03-22',
      },
      {
        id: 12,
        title: 'Add ephemeral command responses with permissions context',
        description:
          'Only show command responses to permitted users with scoped data.',
        status: 'not-started',
        due_date: '2026-03-28',
      },
      {
        id: 13,
        title: 'Enable dynamic config reloads for modules',
        description:
          'Allow bot modules to hot-reload on config update from backend.',
        status: 'not-started',
        due_date: '2026-04-04',
      },
      {
        id: 14,
        title: 'Build ticket stats and reporting system',
        description:
          'Track ticket volume, resolution time, and assigned moderators.',
        status: 'not-started',
        due_date: '2026-04-10',
      },
      {
        id: 15,
        title: 'Implement Discord rate limit handling and retry queue',
        description: 'Gracefully manage API rate limits and queued retries.',
        status: 'not-started',
        due_date: '2026-04-18',
      },
      {
        id: 16,
        title: 'Write unit tests for core moderation and ticket features',
        description:
          'Target >80% coverage for command handlers, middleware, and utils.',
        status: 'not-started',
        due_date: '2026-04-30',
      },
      {
        id: 17,
        title: 'Deploy bot to staging guild via GitHub Actions',
        description:
          'CI deploy to staging Discord server with per-branch preview support.',
        status: 'not-started',
        due_date: '2026-05-10',
      },
      {
        id: 18,
        title: 'Perform load test of slash command throughput',
        description:
          'Use mock user traffic to test latency and bot responsiveness under load.',
        status: 'not-started',
        due_date: '2026-05-20',
      },
      {
        id: 19,
        title: 'Create user/admin documentation and usage guide',
        description: 'Markdown-based docs for moderators and server admins.',
        status: 'not-started',
        due_date: '2026-05-31',
      },
    ],
  },
  {
    phase: 3,
    title: 'Team Management & Auth System Foundations',
    description:
      'Implement full social login, RBAC, team/org grouping, and usage quotas.',
    time_frame: 'June 2026',
    status: 'not-started',
    tasks: [
      {
        id: 20,
        title: 'Design user and team schema in database',
        description:
          'Define relational schema for users, teams, invites, roles, and audit history.',
        status: 'not-started',
        due_date: '2026-06-15',
      },
      {
        id: 21,
        title: 'Implement Discord, Google, and GitHub OAuth2 login',
        description:
          'Set up unified login handler with account linking support and fallback email auth.',
        status: 'not-started',
        due_date: '2026-06-30',
      },
      {
        id: 22,
        title: 'Build account creation flow with fallback email verification',
        description:
          'Enable email-based signup with verification and optional 2FA enforcement.',
        status: 'not-started',
        due_date: '2026-07-10',
      },
      {
        id: 23,
        title: 'Implement per-team RBAC roles and permissions',
        description:
          'Roles include Admin, Developer, Support, Viewer — scoped to team membership.',
        status: 'not-started',
        due_date: '2026-07-20',
      },
      {
        id: 24,
        title: 'Add team invite flow via token or email link',
        description:
          'Allow team owners to invite new users with preset roles and expiration.',
        status: 'not-started',
        due_date: '2026-07-28',
      },
      {
        id: 25,
        title: 'Build account settings page (UI + API)',
        description:
          'Let users update email, avatar, 2FA settings, and linked auth providers.',
        status: 'not-started',
        due_date: '2026-08-05',
      },
      {
        id: 26,
        title: 'Enable org switching and scoped permissions in frontend',
        description:
          'Dropdown selector + enforced scoping for all actions based on current team context.',
        status: 'not-started',
        due_date: '2026-08-15',
      },
      {
        id: 27,
        title: 'Set up billing tier scaffolding (Free, Pro, Enterprise)',
        description:
          'Add tier metadata to team record and enforce limits via middleware.',
        status: 'not-started',
        due_date: '2026-08-25',
      },
      {
        id: 28,
        title: 'Integrate dynamic usage quotas (per team)',
        description:
          'Track API requests, Discord actions, and feature toggles by team.',
        status: 'not-started',
        due_date: '2026-09-05',
      },
      {
        id: 29,
        title: 'Implement global auth middleware and token rotation',
        description:
          'Add refresh token rotation, short-lived access tokens, and JWT guards.',
        status: 'not-started',
        due_date: '2026-09-15',
      },
      {
        id: 30,
        title: 'Instrument auth events with audit trail logging',
        description:
          'Log login attempts, provider links, role changes, and deletions to Loki.',
        status: 'not-started',
        due_date: '2026-09-20',
      },
      {
        id: 31,
        title: 'Add frontend onboarding flow for new users and teams',
        description:
          'Wizard to create team, set role, and integrate bot with Discord server.',
        status: 'not-started',
        due_date: '2026-09-30',
      },
      {
        id: 32,
        title: 'Write Cypress tests for auth flows and permissions',
        description:
          'End-to-end tests for login, org switch, invite, role access gating.',
        status: 'not-started',
        due_date: '2026-10-10',
      },
      {
        id: 33,
        title: 'Publish OpenAPI spec and frontend client SDK',
        description:
          'Generate OpenAPI from backend + distribute TS client for auth/org APIs.',
        status: 'not-started',
        due_date: '2026-10-18',
      },
      {
        id: 34,
        title: 'Document all RBAC roles and scopes for developers',
        description:
          'Human-readable docs and JSON definition for each RBAC level and permission set.',
        status: 'not-started',
        due_date: '2026-10-25',
      },
    ],
  },
  {
    phase: 4,
    title: 'Full Dashboard Experience',
    description:
      'Build a fully featured web dashboard with live config editing, real-time bot sync, and modular visibility by role.',
    time_frame: 'November 2026',
    status: 'not-started',
    tasks: [
      {
        id: 35,
        title: 'Design layout system and navigation shell',
        description:
          'Responsive sidebar + header shell with role-aware routes and links.',
        status: 'not-started',
        due_date: '2026-11-10',
      },
      {
        id: 36,
        title: 'Implement user & team context provider',
        description:
          'Load user/team info once and provide access to nested components.',
        status: 'not-started',
        due_date: '2026-11-15',
      },
      {
        id: 37,
        title: 'Create modular dashboard component loader',
        description:
          'Enable dynamic loading of UI modules (e.g., moderation, tickets, stats) by feature flag or RBAC.',
        status: 'not-started',
        due_date: '2026-11-25',
      },
      {
        id: 38,
        title: 'Build moderation config panel with live bot sync',
        description:
          'Allow admins to toggle mod settings (e.g., auto-mute, banned words) and push to bot without restart.',
        status: 'not-started',
        due_date: '2026-12-05',
      },
      {
        id: 39,
        title: 'Add ticket system configuration UI',
        description:
          'Set up categories, handlers, escalation rules and logging channels via UI.',
        status: 'not-started',
        due_date: '2026-12-12',
      },
      {
        id: 40,
        title: 'Create global settings page',
        description:
          'Configure branding, default roles, webhook endpoints, and integrations.',
        status: 'not-started',
        due_date: '2026-12-18',
      },
      {
        id: 41,
        title: 'Integrate tRPC for live API contract sync',
        description:
          'Leverage tRPC with fully typed endpoints and real-time state updates.',
        status: 'not-started',
        due_date: '2026-12-22',
      },
      {
        id: 42,
        title: 'Implement per-module visibility via RBAC',
        description:
          'Show/hide dashboard modules depending on assigned team roles.',
        status: 'not-started',
        due_date: '2027-01-05',
      },
      {
        id: 43,
        title: 'Add activity log panel (per-user, per-team)',
        description:
          'Display user actions, audit events, and config changes in timeline view.',
        status: 'not-started',
        due_date: '2027-01-15',
      },
      {
        id: 44,
        title: 'Add toast + persistent error reporting system',
        description:
          'Show live and historical error messages from bot/backend/API.',
        status: 'not-started',
        due_date: '2027-01-22',
      },
      {
        id: 45,
        title: 'Enable dynamic theme and accessibility controls',
        description:
          'Let users toggle light/dark mode, font scaling, and keyboard nav.',
        status: 'not-started',
        due_date: '2027-01-30',
      },
      {
        id: 46,
        title: 'Integrate feedback widget and bug report form',
        description:
          'Collect structured feedback and send to internal Discord webhook.',
        status: 'not-started',
        due_date: '2027-02-05',
      },
      {
        id: 47,
        title: 'Build loading and error boundary wrappers for dashboard routes',
        description:
          'Gracefully handle async loading and API errors for route-bound components.',
        status: 'not-started',
        due_date: '2027-02-10',
      },
      {
        id: 48,
        title: 'Write unit + Cypress tests for critical dashboard paths',
        description:
          'Test login state, RBAC route guards, config panel interactions.',
        status: 'not-started',
        due_date: '2027-02-20',
      },
      {
        id: 49,
        title: 'Ship MVP to staging with feature flag gating',
        description:
          'Deploy dashboard to preview URL with config flags for modular rollout.',
        status: 'not-started',
        due_date: '2027-02-28',
      },
    ],
  },
  {
    phase: 5,
    title: 'Subscriptions & Payments',
    description:
      'Integrate pricing plans, Stripe billing, usage enforcement, and customer portal.',
    time_frame: 'March 2027',
    status: 'not-started',
    tasks: [
      {
        id: 50,
        title: 'Design pricing model and team tier schema',
        description:
          'Define internal metadata for Free, Pro, and Enterprise tiers with quota caps and feature gates.',
        status: 'not-started',
        due_date: '2027-03-10',
      },
      {
        id: 51,
        title: 'Set up Stripe products, prices, and webhooks',
        description:
          'Create pricing objects in Stripe dashboard and subscribe to payment + subscription events.',
        status: 'not-started',
        due_date: '2027-03-15',
      },
      {
        id: 52,
        title: 'Implement secure webhook handler with replay protection',
        description:
          'Verify Stripe signatures, store events, and handle idempotent updates to billing state.',
        status: 'not-started',
        due_date: '2027-03-20',
      },
      {
        id: 53,
        title: 'Create billing portal session integration',
        description:
          'Allow users to update payment methods and cancel plans via Stripe-hosted portal.',
        status: 'not-started',
        due_date: '2027-03-25',
      },
      {
        id: 54,
        title: 'Build billing summary UI in dashboard',
        description:
          'Show current plan, usage stats, renewal date, and billing history.',
        status: 'not-started',
        due_date: '2027-04-05',
      },
      {
        id: 55,
        title: 'Add feature gating logic by plan tier',
        description:
          'Wrap features behind RBAC-style checks that read from team.billingTier.',
        status: 'not-started',
        due_date: '2027-04-10',
      },
      {
        id: 56,
        title: 'Track usage metrics per team',
        description:
          'Log Discord actions, API requests, and ticket counts to a per-team usage ledger.',
        status: 'not-started',
        due_date: '2027-04-18',
      },
      {
        id: 57,
        title: 'Enforce usage limits with soft and hard caps',
        description:
          'Notify users at 80% usage and block actions at 100% (unless Enterprise override).',
        status: 'not-started',
        due_date: '2027-04-25',
      },
      {
        id: 58,
        title: 'Send renewal and overage alerts via email and Discord',
        description:
          'Notify billing contacts using background job triggered by thresholds or status changes.',
        status: 'not-started',
        due_date: '2027-05-05',
      },
      {
        id: 59,
        title: 'Integrate team creation flow with billing requirement',
        description:
          'Require billing setup for new Pro/Enterprise teams, bypass for Free plan.',
        status: 'not-started',
        due_date: '2027-05-12',
      },
      {
        id: 60,
        title: 'Create Sentry alerting for failed webhook events',
        description:
          'Detect and alert on webhook delivery failures or invalid state transitions.',
        status: 'not-started',
        due_date: '2027-05-18',
      },
      {
        id: 61,
        title: 'Write unit and integration tests for billing flows',
        description:
          'Test subscriptions, invoice events, feature gating, and usage enforcement.',
        status: 'not-started',
        due_date: '2027-05-25',
      },
      {
        id: 62,
        title: 'Document billing tier behavior and admin override API',
        description:
          'Write internal docs for ops + support explaining how to grant exceptions or escalate billing cases.',
        status: 'not-started',
        due_date: '2027-06-01',
      },
    ],
  },
  {
    phase: 6,
    title: 'Advanced Bot Modules',
    description:
      'Implement interactive bot modules: polls, music, leveling, and starboard with full dashboard config and RBAC gating.',
    time_frame: 'July 2027',
    status: 'not-started',
    tasks: [
      {
        id: 63,
        title: 'Define bot module registry and load system',
        description:
          'Create internal structure to enable hot-loaded, toggleable modules by config.',
        status: 'not-started',
        due_date: '2027-07-10',
      },
      {
        id: 64,
        title: 'Implement interactive poll module',
        description:
          'Slash command to create polls with buttons, real-time vote counts, and permissions checks.',
        status: 'not-started',
        due_date: '2027-07-20',
      },
      {
        id: 65,
        title: 'Add poll results export + anonymized vote logging',
        description:
          'Allow poll creators to download CSV results; persist votes with optional anonymity.',
        status: 'not-started',
        due_date: '2027-07-28',
      },
      {
        id: 66,
        title: 'Build leveling system with XP, ranks, and custom rewards',
        description:
          'Track message-based XP, display user ranks, and trigger role rewards at milestones.',
        status: 'not-started',
        due_date: '2027-08-10',
      },
      {
        id: 67,
        title: 'Create leaderboard and user profile UI in Discord',
        description:
          'Embed leaderboard and rank info with rich embeds and profile lookup slash command.',
        status: 'not-started',
        due_date: '2027-08-20',
      },
      {
        id: 68,
        title: 'Implement music module with Lavalink support',
        description:
          'Support slash-based queuing, search, playlists, and playback controls.',
        status: 'not-started',
        due_date: '2027-08-30',
      },
      {
        id: 69,
        title: 'Add per-server music limits and premium-only features',
        description:
          'Gate volume, queue length, and playlist saving by team billing tier.',
        status: 'not-started',
        due_date: '2027-09-05',
      },
      {
        id: 70,
        title: 'Build starboard system with emoji threshold triggers',
        description:
          'Automatically repost messages to a starboard channel after emoji count threshold.',
        status: 'not-started',
        due_date: '2027-09-15',
      },
      {
        id: 71,
        title: 'Add dashboard UI to enable/disable each module',
        description:
          'Expose config toggles for all modules with RBAC-aware visibility.',
        status: 'not-started',
        due_date: '2027-09-22',
      },
      {
        id: 72,
        title: 'Cache leaderboard + XP data using Redis or in-memory LRU',
        description:
          'Offload frequent lookups to reduce database load and improve latency.',
        status: 'not-started',
        due_date: '2027-09-30',
      },
      {
        id: 73,
        title: 'Write unit tests and integration mocks for all modules',
        description:
          'Test command handlers, event triggers, and module toggling logic.',
        status: 'not-started',
        due_date: '2027-10-10',
      },
      {
        id: 74,
        title: 'Track module usage metrics and errors via Prometheus + Loki',
        description:
          'Expose per-module invocation counts, latency, and error rates in dashboards.',
        status: 'not-started',
        due_date: '2027-10-18',
      },
      {
        id: 75,
        title: 'Publish module developer guide and contribution standards',
        description:
          'Write internal docs for adding new bot modules with shared hooks and structure.',
        status: 'not-started',
        due_date: '2027-10-25',
      },
    ],
  },
  {
    phase: 'future-development',
    title: 'Future Development',
    description:
      'Placeholder for planned modules, features, and architectural enhancements beyond the current 6-phase scope.',
    time_frame: 'TBD',
    status: 'not-started',
    tasks: [
      {
        id: 76,
        title: 'Implement cross-org federation',
        description:
          'Allow users to operate across multiple teams/orgs with scoped permissions and unified identity.',
        status: 'not-started',
      },
      {
        id: 77,
        title: 'Add native mobile app for team alerts and approvals',
        description:
          'iOS/Android app to handle alerts, moderation actions, and real-time stats.',
        status: 'not-started',
      },
      {
        id: 78,
        title: 'Integrate with Slack and Microsoft Teams',
        description:
          'Support alternative chat platforms using shared bot core with modular adapters.',
        status: 'not-started',
      },
      {
        id: 79,
        title: 'Launch AI-powered response assistant',
        description:
          'Let the bot assist with rule-based + LLM-informed responses to tickets or mod requests.',
        status: 'not-started',
      },
      {
        id: 80,
        title: 'Enable Discord bot localization',
        description:
          'Support multi-language interactions and content via i18n infrastructure.',
        status: 'not-started',
      },
    ],
  },
]

export default RoadmapPhases
