// libs/db/src/entities/index.ts

/**
 * Central export hub for all MikroORM entities in Helix.
 * Each domain is grouped by feature area for cleaner imports.
 *
 * Example:
 * ```ts
 * import { User, Org, Invoice, Connector } from '@helix-ai/db/entities';
 * ```
 */

// ---------------------------------------------------------------------
// Core / Org
// ---------------------------------------------------------------------
export * from './org/org.entity';
export * from './org/org-member.entity';

// ---------------------------------------------------------------------
// User & Profile
// ---------------------------------------------------------------------
export * from './user/user.entity';
export * from './user/profile.entity';
export * from './user/settings.entity';
export * from './user/account.entity';
export * from './user/session.entity';
export * from './user/verification-token.entity';

// ---------------------------------------------------------------------
// System / Governance
// ---------------------------------------------------------------------
export * from './system/audit.entity';
export * from './system/notification.entity';
export * from './system/ticket.entity';
export * from './growth/waitlist.entity';
export * from './system/api-key.entity';

// ---------------------------------------------------------------------
// Billing / Metering
// ---------------------------------------------------------------------
export * from './billing/customer.entity';
export * from './billing/invoice.entity';
export * from './billing/payment.entity';
export * from './billing/usage-meter.entity';

// ---------------------------------------------------------------------
// Assistant / Automation
// ---------------------------------------------------------------------
export * from './assistant/conversation.entity';
export * from './assistant/message.entity';
export * from './assistant/run.entity';
export * from './assistant/run-log.entity';
export * from './assistant/webhook-subscription.entity';
export * from './assistant/webhook-delivery.entity';

// ---------------------------------------------------------------------
// ABAC / Policy
// ---------------------------------------------------------------------
export * from './abac/policy.entity';

// ---------------------------------------------------------------------
// Integrations
// ---------------------------------------------------------------------
export * from './integrations/connector.entity';
export * from './integrations/connector-secret.entity';

// ---------------------------------------------------------------------
// Security / KMS
// ---------------------------------------------------------------------
export * from './security/secret.entity';
export * from './security/kms-key.entity';

// ---------------------------------------------------------------------
// Edge / IoT
// ---------------------------------------------------------------------
export * from './edge/agent.entity';
export * from './edge/device.entity';
export * from './edge/deployment.entity';
