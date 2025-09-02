import type { Phase } from '../../../../types/docs'

/** ---------- Roadmap Data ---------- */

export const RoadmapPhases: Phase[] = [
  {
    phase: 1,
    title: 'Core Architecture Bootstrapping & Documentation',
    description:
      'Set up CI/CD, secrets management, basic service scaffolds, and observability stack.',
    time_frame: 'October 2025',
    status: 'in-progress',
    tasks: [
      {
        id: 'p1-000',
        title: 'Documentation Phase 1',
        description:
          'Initial documentation, Including Main information describing the project, its vision, and roadmap.',
        status: 'in-progress',
        assigned_to: 'Timothy Pierce'
      },
      {
        id: 'p1-001',
        title: 'Initialize GitHub Actions pipeline',
        description:
          'Configure semantic version gating, test/lint/build stages.',
        status: 'completed',
        assigned_to: 'Timothy Pierce',
        completion_date: '2025-08-10'
      },
      {
        id: 'p1-002',
        title: 'Set up Vault + SOPS secrets integration',
        description: 'Securely manage secrets via GitOps-safe encryption.',
        status: 'not-started',
        assigned_to: 'Timothy Pierce'
      },
      {
        id: 'p1-003',
        title: 'Provision Prometheus + Grafana dashboards',
        description:
          'Deploy metrics stack with initial service-level SLO views.',
        status: 'not-started',
        assigned_to: 'Timothy Pierce'
      },
      {
        id: 'p1-004',
        title: 'Set up Loki + Fluentbit log pipeline',
        description:
          'Structured logging with searchable, filtered access per microservice.',
        status: 'not-started'
      },
      {
        id: 'p1-005',
        title: 'Deploy Tempo + Jaeger tracing',
        description:
          'Instrument core services for distributed tracing support.',
        status: 'not-started'
      },
      {
        id: 'p1-006',
        title: 'Create Helm charts for baseline services',
        description:
          'Create reusable Helm charts for Grafana, Prometheus, Loki, Tempo, and Vault.',
        status: 'not-started'
      },
      {
        id: 'p1-007',
        title: 'Build base NestJS microservice scaffold',
        description:
          'Includes OpenAPI generation, DTO validation, RBAC hooks, and tracing stubs.',
        status: 'not-started'
      },
      {
        id: 'p1-008',
        title: 'Build base FastAPI scaffold for Python services',
        description:
          'Async-ready scaffold with Sentry, metrics, pydantic schemas, and JWT guard middleware.',
        status: 'not-started'
      },
      {
        id: 'p1-009',
        title: 'Establish centralized config loader (Vault-backed)',
        description:
          'Support dynamic config reload and encrypted secret mounts.',
        status: 'not-started'
      },
      {
        id: 'p1-010',
        title: 'Set up RKE2 Kubernetes cluster',
        description:
          'Provision dev environment with Rancher or kubeadm-managed RKE2 + containerd.',
        status: 'not-started'
      },
      {
        id: 'p1-011',
        title: 'Install Istio service mesh with mTLS',
        description:
          'Add zero-trust, in-cluster security and service discovery features.',
        status: 'not-started'
      },
      {
        id: 'p1-012',
        title: 'Set up KrakenD API gateway with autoscaling',
        description:
          'Route service traffic through KrakenD with retries and circuit breakers.',
        status: 'not-started'
      },
      {
        id: 'p1-013',
        title: 'Configure ExternalDNS + cert-manager',
        description:
          'Automatic DNS record creation and TLS cert issuance per ingress.',
        status: 'not-started'
      },
      {
        id: 'p1-014',
        title: 'Deploy basic alerting stack (PrometheusRule + Discord webhook)',
        description:
          'Alerting via Grafana + Prometheus + routed to Discord channel.',
        status: 'not-started'
      },
      {
        id: 'p1-015',
        title: 'Write IaC (Terraform + Ansible) for infra reproducibility',
        description:
          'Provision infra in dev/staging using codified templates and secure roles.',
        status: 'not-started'
      },
      {
        id: 'p1-016',
        title: 'Implement GitOps delivery via FluxCD',
        description:
          'Sync cluster state from Git repo using Flux for declarative deploys.',
        status: 'not-started'
      },
      {
        id: 'p1-017',
        title: 'Perform initial chaos test with Chaos Mesh',
        description:
          'Run resilience tests (latency, pod kill, DNS drop) and measure SLO tolerance.',
        status: 'not-started'
      },
      {
        id: 'p1-018',
        title: 'Conduct security scan with Falco + CrowdSec',
        description: 'Enable runtime threat detection and alerting in RKE2.',
        status: 'not-started'
      },
      {
        id: 'p1-019',
        title: 'Document architecture + bootstrapping guide',
        description:
          'Create high-level diagrams and reproducible setup scripts for onboarding.',
        status: 'not-started'
      }
    ]
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
        id: 'p2-004',
        title: 'Build mod-logs and moderation tools',
        description:
          'Includes auto-moderation, role escalations, and logs export.',
        status: 'not-started',
        assigned_to: 'Timothy Pierce'
      },
      {
        id: 'p2-005',
        title: 'Implement ticketing system with slash commands',
        description:
          'Enable private thread creation, tagging, and audit trail.',
        status: 'not-started',
        assigned_to: 'Timothy Pierce'
      },
      {
        id: 'p2-006',
        title: 'Integrate Discord OAuth2 and role-based access',
        description:
          'Enable login and bot control access via Discord roles and permissions.',
        status: 'not-started'
      },
      {
        id: 'p2-007',
        title: 'Implement command router with permissions',
        description:
          'Centralized slash command registration with per-role gating and cooldowns.',
        status: 'not-started'
      },
      {
        id: 'p2-008',
        title: 'Add support for mod notes and user history',
        description:
          'Persistent storage and UI for viewing mod actions per user.',
        status: 'not-started'
      },
      {
        id: 'p2-009',
        title: 'Deploy RBAC module via backend sync',
        description:
          'Use centralized RBAC definitions synced to Discord commands.',
        status: 'not-started'
      },
      {
        id: 'p2-010',
        title: 'Build interactive punishment workflow (buttons/menus)',
        description:
          'Enable structured actions (mute, warn, ban) via UI components.',
        status: 'not-started'
      },
      {
        id: 'p2-011',
        title: 'Implement audit trail logging and webhook sync',
        description:
          'Persist all admin/mod actions and notify a dedicated logs channel.',
        status: 'not-started'
      },
      {
        id: 'p2-012',
        title: 'Add ephemeral command responses with permissions context',
        description:
          'Only show command responses to permitted users with scoped data.',
        status: 'not-started'
      },
      {
        id: 'p2-013',
        title: 'Enable dynamic config reloads for modules',
        description:
          'Allow bot modules to hot-reload on config update from backend.',
        status: 'not-started'
      },
      {
        id: 'p2-014',
        title: 'Build ticket stats and reporting system',
        description:
          'Track ticket volume, resolution time, and assigned moderators.',
        status: 'not-started'
      },
      {
        id: 'p2-015',
        title: 'Implement Discord rate limit handling and retry queue',
        description: 'Gracefully manage API rate limits and queued retries.',
        status: 'not-started'
      },
      {
        id: 'p2-016',
        title: 'Write unit tests for core moderation and ticket features',
        description:
          'Target >80% coverage for command handlers, middleware, and utils.',
        status: 'not-started'
      },
      {
        id: 'p2-017',
        title: 'Deploy bot to staging guild via GitHub Actions',
        description:
          'CI deploy to staging Discord server with per-branch preview support.',
        status: 'not-started'
      },
      {
        id: 'p2-018',
        title: 'Perform load test of slash command throughput',
        description:
          'Use mock user traffic to test latency and bot responsiveness under load.',
        status: 'not-started'
      },
      {
        id: 'p2-019',
        title: 'Create user/admin documentation and usage guide',
        description: 'Markdown-based docs for moderators and server admins.',
        status: 'not-started'
      }
    ]
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
        id: 'p3-020',
        title: 'Design user and team schema in database',
        description:
          'Define relational schema for users, teams, invites, roles, and audit history.',
        status: 'not-started'
      },
      {
        id: 'p3-021',
        title: 'Implement Discord, Google, and GitHub OAuth2 login',
        description:
          'Set up unified login handler with account linking support and fallback email auth.',
        status: 'not-started'
      },
      {
        id: 'p3-022',
        title: 'Build account creation flow with fallback email verification',
        description:
          'Enable email-based signup with verification and optional 2FA enforcement.',
        status: 'not-started'
      },
      {
        id: 'p3-023',
        title: 'Implement per-team RBAC roles and permissions',
        description:
          'Roles include Admin, Developer, Support, Viewer — scoped to team membership.',
        status: 'not-started'
      },
      {
        id: 'p3-024',
        title: 'Add team invite flow via token or email link',
        description:
          'Allow team owners to invite new users with preset roles and expiration.',
        status: 'not-started'
      },
      {
        id: 'p3-025',
        title: 'Build account settings page (UI + API)',
        description:
          'Let users update email, avatar, 2FA settings, and linked auth providers.',
        status: 'not-started'
      },
      {
        id: 'p3-026',
        title: 'Enable org switching and scoped permissions in frontend',
        description:
          'Dropdown selector + enforced scoping for all actions based on current team context.',
        status: 'not-started'
      },
      {
        id: 'p3-027',
        title: 'Set up billing tier scaffolding (Free, Pro, Enterprise)',
        description:
          'Add tier metadata to team record and enforce limits via middleware.',
        status: 'not-started'
      },
      {
        id: 'p3-028',
        title: 'Integrate dynamic usage quotas (per team)',
        description:
          'Track API requests, Discord actions, and feature toggles by team.',
        status: 'not-started'
      },
      {
        id: 'p3-029',
        title: 'Implement global auth middleware and token rotation',
        description:
          'Add refresh token rotation, short-lived access tokens, and JWT guards.',
        status: 'not-started'
      },
      {
        id: 'p3-030',
        title: 'Instrument auth events with audit trail logging',
        description:
          'Log login attempts, provider links, role changes, and deletions to Loki.',
        status: 'not-started'
      },
      {
        id: 'p3-031',
        title: 'Add frontend onboarding flow for new users and teams',
        description:
          'Wizard to create team, set role, and integrate bot with Discord server.',
        status: 'not-started'
      },
      {
        id: 'p3-032',
        title: 'Write Cypress tests for auth flows and permissions',
        description:
          'End-to-end tests for login, org switch, invite, role access gating.',
        status: 'not-started'
      },
      {
        id: 'p3-033',
        title: 'Publish OpenAPI spec and frontend client SDK',
        description:
          'Generate OpenAPI from backend + distribute TS client for auth/org APIs.',
        status: 'not-started'
      },
      {
        id: 'p3-034',
        title: 'Document all RBAC roles and scopes for developers',
        description:
          'Human-readable docs and JSON definition for each RBAC level and permission set.',
        status: 'not-started'
      }
    ]
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
        id: 'p4-035',
        title: 'Design layout system and navigation shell',
        description:
          'Responsive sidebar + header shell with role-aware routes and links.',
        status: 'not-started'
      },
      {
        id: 'p4-036',
        title: 'Implement user & team context provider',
        description:
          'Load user/team info once and provide access to nested components.',
        status: 'not-started'
      },
      {
        id: 'p4-037',
        title: 'Create modular dashboard component loader',
        description:
          'Enable dynamic loading of UI modules (e.g., moderation, tickets, stats) by feature flag or RBAC.',
        status: 'not-started'
      },
      {
        id: 'p4-038',
        title: 'Build moderation config panel with live bot sync',
        description:
          'Allow admins to toggle mod settings (e.g., auto-mute, banned words) and push to bot without restart.',
        status: 'not-started'
      },
      {
        id: 'p4-039',
        title: 'Add ticket system configuration UI',
        description:
          'Set up categories, handlers, escalation rules and logging channels via UI.',
        status: 'not-started'
      },
      {
        id: 'p4-040',
        title: 'Create global settings page',
        description:
          'Configure branding, default roles, webhook endpoints, and integrations.',
        status: 'not-started'
      },
      {
        id: 'p4-041',
        title: 'Integrate tRPC for live API contract sync',
        description:
          'Leverage tRPC with fully typed endpoints and real-time state updates.',
        status: 'not-started'
      },
      {
        id: 'p4-042',
        title: 'Implement per-module visibility via RBAC',
        description:
          'Show/hide dashboard modules depending on assigned team roles.',
        status: 'not-started'
      },
      {
        id: 'p4-043',
        title: 'Add activity log panel (per-user, per-team)',
        description:
          'Display user actions, audit events, and config changes in timeline view.',
        status: 'not-started'
      },
      {
        id: 'p4-044',
        title: 'Add toast + persistent error reporting system',
        description:
          'Show live and historical error messages from bot/backend/API.',
        status: 'not-started'
      },
      {
        id: 'p4-045',
        title: 'Enable dynamic theme and accessibility controls',
        description:
          'Let users toggle light/dark mode, font scaling, and keyboard nav.',
        status: 'not-started'
      },
      {
        id: 'p4-046',
        title: 'Integrate feedback widget and bug report form',
        description:
          'Collect structured feedback and send to internal Discord webhook.',
        status: 'not-started'
      },
      {
        id: 'p4-047',
        title: 'Build loading and error boundary wrappers for dashboard routes',
        description:
          'Gracefully handle async loading and API errors for route-bound components.',
        status: 'not-started'
      },
      {
        id: 'p4-048',
        title: 'Write unit + Cypress tests for critical dashboard paths',
        description:
          'Test login state, RBAC route guards, config panel interactions.',
        status: 'not-started'
      },
      {
        id: 'p4-049',
        title: 'Ship MVP to staging with feature flag gating',
        description:
          'Deploy dashboard to preview URL with config flags for modular rollout.',
        status: 'not-started'
      }
    ]
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
        id: 'p5-050',
        title: 'Design pricing model and team tier schema',
        description:
          'Define internal metadata for Free, Pro, and Enterprise tiers with quota caps and feature gates.',
        status: 'not-started'
      },
      {
        id: 'p5-051',
        title: 'Set up Stripe products, prices, and webhooks',
        description:
          'Create pricing objects in Stripe dashboard and subscribe to payment + subscription events.',
        status: 'not-started'
      },
      {
        id: 'p5-052',
        title: 'Implement secure webhook handler with replay protection',
        description:
          'Verify Stripe signatures, store events, and handle idempotent updates to billing state.',
        status: 'not-started'
      },
      {
        id: 'p5-053',
        title: 'Create billing portal session integration',
        description:
          'Allow users to update payment methods and cancel plans via Stripe-hosted portal.',
        status: 'not-started'
      },
      {
        id: 'p5-054',
        title: 'Build billing summary UI in dashboard',
        description:
          'Show current plan, usage stats, renewal date, and billing history.',
        status: 'not-started'
      },
      {
        id: 'p5-055',
        title: 'Add feature gating logic by plan tier',
        description:
          'Wrap features behind RBAC-style checks that read from team.billingTier.',
        status: 'not-started'
      },
      {
        id: 'p5-056',
        title: 'Track usage metrics per team',
        description:
          'Log Discord actions, API requests, and ticket counts to a per-team usage ledger.',
        status: 'not-started'
      },
      {
        id: 'p5-057',
        title: 'Enforce usage limits with soft and hard caps',
        description:
          'Notify users at 80% usage and block actions at 100% (unless Enterprise override).',
        status: 'not-started'
      },
      {
        id: 'p5-058',
        title: 'Send renewal and overage alerts via email and Discord',
        description:
          'Notify billing contacts using background job triggered by thresholds or status changes.',
        status: 'not-started'
      },
      {
        id: 'p5-059',
        title: 'Integrate team creation flow with billing requirement',
        description:
          'Require billing setup for new Pro/Enterprise teams, bypass for Free plan.',
        status: 'not-started'
      },
      {
        id: 'p5-060',
        title: 'Create Sentry alerting for failed webhook events',
        description:
          'Detect and alert on webhook delivery failures or invalid state transitions.',
        status: 'not-started'
      },
      {
        id: 'p5-061',
        title: 'Write unit and integration tests for billing flows',
        description:
          'Test subscriptions, invoice events, feature gating, and usage enforcement.',
        status: 'not-started'
      },
      {
        id: 'p5-062',
        title: 'Document billing tier behavior and admin override API',
        description:
          'Write internal docs for ops + support explaining how to grant exceptions or escalate billing cases.',
        status: 'not-started'
      }
    ]
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
        id: 'pX-076',
        title: 'Implement cross-org federation',
        description:
          'Allow users to operate across multiple teams/orgs with scoped permissions and unified identity.',
        status: 'not-started'
      },
      {
        id: 'pX-077',
        title: 'Add native mobile app for team alerts and approvals',
        description:
          'iOS/Android app to handle alerts, moderation actions, and real-time stats.',
        status: 'not-started'
      },
      {
        id: 'pX-078',
        title: 'Integrate with Slack and Microsoft Teams',
        description:
          'Support alternative chat platforms using shared bot core with modular adapters.',
        status: 'not-started'
      },
      {
        id: 'pX-079',
        title: 'Launch AI-powered response assistant',
        description:
          'Let the bot assist with rule-based + LLM-informed responses to tickets or mod requests.',
        status: 'not-started'
      },
      {
        id: 'pX-080',
        title: 'Enable Discord bot localization',
        description:
          'Support multi-language interactions and content via i18n infrastructure.',
        status: 'not-started'
      }
    ]
  }
] as const

export default RoadmapPhases
