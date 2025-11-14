// libs/db/src/entities/org/org.entity.ts

import {
  Entity,
  Property,
  OneToMany,
  OneToOne,
  Collection,
  Cascade,
  Index,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';

// ---- Related entities (create/adjust paths as you add them) ----
import { OrgMember } from './org-member.entity';
import { OrgSettings } from '../settings/org-settings.entity';

import { ApiKey } from '../system/api-key.entity';
import { Audit } from '../system/audit.entity';

import { Customer } from '../billing/customer.entity';
import { Invoice } from '../billing/invoice.entity';
import { UsageMeter } from '../billing/usage-meter.entity';

import { Policy } from '../abac/policy.entity';

import { WebhookSubscription } from '../assistant/webhook-subscription.entity';
import { WebhookDelivery } from '../assistant/webhook-delivery.entity';
import { Conversation } from '../assistant/conversation.entity';
import { Run } from '../assistant/run.entity';

import { Agent } from '../edge/agent.entity';
import { Device } from '../edge/device.entity';
import { Deployment } from '../edge/deployment.entity';

import { Connector } from '../integrations/connector.entity';
import { ConnectorSecret } from '../integrations/connector-secret.entity';

import { Secret } from '../security/secret.entity';
import { KmsKey } from '../security/kms-key.entity';

/**
 * Org (tenant)
 *
 * Table: org
 */
@Entity({ tableName: 'org' })
@Index({ name: 'idx_org_name', properties: ['name'] })
export class Org extends BaseEntity {
  // ---------------------------------------------------------------------
  // Core fields
  // ---------------------------------------------------------------------

  @Property({ type: 'text' })
  name!: string;

  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  // ---------------------------------------------------------------------
  // Profile & Settings (1:1 inverse; owning side is OrgSettings)
  // ---------------------------------------------------------------------

  @OneToOne(() => OrgSettings, (settings: OrgSettings) => settings.org, { nullable: true })
  settings?: Rel<OrgSettings>;

  // ---------------------------------------------------------------------
  // Memberships
  // ---------------------------------------------------------------------

  @OneToMany(() => OrgMember, (member: OrgMember) => member.org, {
    cascade: [Cascade.PERSIST],
  })
  members = new Collection<Rel<OrgMember>>(this);

  // ---------------------------------------------------------------------
  // Governance / Security
  // ---------------------------------------------------------------------

  @OneToMany(() => ApiKey, (apiKey: ApiKey) => apiKey.org, {
    cascade: [Cascade.PERSIST],
  })
  apiKeys = new Collection<Rel<ApiKey>>(this);

  @OneToMany(() => Audit, (audit: Audit) => audit.org, {
    cascade: [Cascade.PERSIST],
  })
  audits = new Collection<Rel<Audit>>(this);

  @OneToMany(() => Secret, (secret: Secret) => secret.org, {
    cascade: [Cascade.PERSIST],
  })
  secrets = new Collection<Rel<Secret>>(this);

  @OneToMany(() => KmsKey, (kmsKey: KmsKey) => kmsKey.org, {
    cascade: [Cascade.PERSIST],
  })
  kmsKeys = new Collection<Rel<KmsKey>>(this);

  // ---------------------------------------------------------------------
  // Billing / Metering
  // ---------------------------------------------------------------------

  @OneToMany(() => Customer, (customer: Customer) => customer.org, {
    cascade: [Cascade.PERSIST],
  })
  customers = new Collection<Rel<Customer>>(this);

  @OneToMany(() => Invoice, (invoice: Invoice) => invoice.org)
  invoices = new Collection<Rel<Invoice>>(this);

  @OneToMany(() => UsageMeter, (usageMeter: UsageMeter) => usageMeter.org)
  usageMeters = new Collection<Rel<UsageMeter>>(this);

  // ---------------------------------------------------------------------
  // ABAC / Policy
  // ---------------------------------------------------------------------

  @OneToMany(() => Policy, (policy: Policy) => policy.org, {
    cascade: [Cascade.PERSIST],
  })
  policies = new Collection<Rel<Policy>>(this);

  // ---------------------------------------------------------------------
  // Assistant / Automations
  // ---------------------------------------------------------------------

  @OneToMany(() => Conversation, (conversation: Conversation) => conversation.org)
  conversations = new Collection<Rel<Conversation>>(this);

  @OneToMany(() => Run, (run: Run) => run.org)
  runs = new Collection<Rel<Run>>(this);

  @OneToMany(() => WebhookSubscription, (subscription: WebhookSubscription) => subscription.org, {
    cascade: [Cascade.PERSIST],
  })
  webhookSubscriptions = new Collection<Rel<WebhookSubscription>>(this);

  @OneToMany(() => WebhookDelivery, (delivery: WebhookDelivery) => delivery.org)
  webhookDeliveries = new Collection<Rel<WebhookDelivery>>(this);

  // ---------------------------------------------------------------------
  // Integrations
  // ---------------------------------------------------------------------

  @OneToMany(() => Connector, (connector: Connector) => connector.org, {
    cascade: [Cascade.PERSIST],
  })
  connectors = new Collection<Rel<Connector>>(this);

  @OneToMany(() => ConnectorSecret, (connectorSecret: ConnectorSecret) => connectorSecret.org, {
    cascade: [Cascade.PERSIST],
  })
  connectorSecrets = new Collection<Rel<ConnectorSecret>>(this);

  // ---------------------------------------------------------------------
  // Edge / IoT
  // ---------------------------------------------------------------------

  @OneToMany(() => Agent, (agent: Agent) => agent.org)
  agents = new Collection<Rel<Agent>>(this);

  @OneToMany(() => Device, (device: Device) => device.org)
  devices = new Collection<Rel<Device>>(this);

  @OneToMany(() => Deployment, (deployment: Deployment) => deployment.org)
  deployments = new Collection<Rel<Deployment>>(this);
}
