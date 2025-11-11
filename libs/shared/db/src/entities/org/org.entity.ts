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

  @OneToOne(() => OrgSettings, (s) => s.org, { nullable: true })
  settings?: Rel<OrgSettings>;

  // ---------------------------------------------------------------------
  // Memberships
  // ---------------------------------------------------------------------

  @OneToMany(() => OrgMember, (m) => m.org, {
    cascade: [Cascade.PERSIST],
  })
  members = new Collection<Rel<OrgMember>>(this);

  // ---------------------------------------------------------------------
  // Governance / Security
  // ---------------------------------------------------------------------

  @OneToMany(() => ApiKey, (k) => k.org, {
    cascade: [Cascade.PERSIST],
  })
  apiKeys = new Collection<Rel<ApiKey>>(this);

  @OneToMany(() => Audit, (a) => a.org, {
    cascade: [Cascade.PERSIST],
  })
  audits = new Collection<Rel<Audit>>(this);

  @OneToMany(() => Secret, (s) => s.org, {
    cascade: [Cascade.PERSIST],
  })
  secrets = new Collection<Rel<Secret>>(this);

  @OneToMany(() => KmsKey, (k) => k.org, {
    cascade: [Cascade.PERSIST],
  })
  kmsKeys = new Collection<Rel<KmsKey>>(this);

  // ---------------------------------------------------------------------
  // Billing / Metering
  // ---------------------------------------------------------------------

  @OneToMany(() => Customer, (c) => c.org, {
    cascade: [Cascade.PERSIST],
  })
  customers = new Collection<Rel<Customer>>(this);

  @OneToMany(() => Invoice, (i) => i.org)
  invoices = new Collection<Rel<Invoice>>(this);

  @OneToMany(() => UsageMeter, (m) => m.org)
  usageMeters = new Collection<Rel<UsageMeter>>(this);

  // ---------------------------------------------------------------------
  // ABAC / Policy
  // ---------------------------------------------------------------------

  @OneToMany(() => Policy, (p) => p.org, {
    cascade: [Cascade.PERSIST],
  })
  policies = new Collection<Rel<Policy>>(this);

  // ---------------------------------------------------------------------
  // Assistant / Automations
  // ---------------------------------------------------------------------

  @OneToMany(() => Conversation, (c) => c.org)
  conversations = new Collection<Rel<Conversation>>(this);

  @OneToMany(() => Run, (r) => r.org)
  runs = new Collection<Rel<Run>>(this);

  @OneToMany(() => WebhookSubscription, (s) => s.org, {
    cascade: [Cascade.PERSIST],
  })
  webhookSubscriptions = new Collection<Rel<WebhookSubscription>>(this);

  @OneToMany(() => WebhookDelivery, (d) => d.org)
  webhookDeliveries = new Collection<Rel<WebhookDelivery>>(this);

  // ---------------------------------------------------------------------
  // Integrations
  // ---------------------------------------------------------------------

  @OneToMany(() => Connector, (c) => c.org, {
    cascade: [Cascade.PERSIST],
  })
  connectors = new Collection<Rel<Connector>>(this);

  @OneToMany(() => ConnectorSecret, (cs) => cs.org, {
    cascade: [Cascade.PERSIST],
  })
  connectorSecrets = new Collection<Rel<ConnectorSecret>>(this);

  // ---------------------------------------------------------------------
  // Edge / IoT
  // ---------------------------------------------------------------------

  @OneToMany(() => Agent, (a) => a.org)
  agents = new Collection<Rel<Agent>>(this);

  @OneToMany(() => Device, (d) => d.org)
  devices = new Collection<Rel<Device>>(this);

  @OneToMany(() => Deployment, (d) => d.org)
  deployments = new Collection<Rel<Deployment>>(this);
}
