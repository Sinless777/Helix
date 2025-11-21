// libs/db/src/entities/assistant/webhook-subscription.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  OneToMany,
  Index,
  type Rel,
  Cascade,
  Collection,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Org } from '../org/org.entity';
import { WebhookDelivery } from './webhook-delivery.entity';

/**
 * 🔹 WebhookSubscription
 *
 * Represents an event subscription for outbound webhook delivery.
 *
 * Each organization can have multiple webhook subscriptions, listening
 * for specific events (e.g., “invoice.created”, “conversation.updated”).
 *
 * Table: assistant_webhook_subscription
 */
@Entity({ tableName: 'assistant_webhook_subscription' })
@Index({ name: 'idx_webhook_org_event', properties: ['org', 'event'] })
export class WebhookSubscription extends BaseEntity {
  // ---------------------------------------------------------------------
  // Relationships
  // ---------------------------------------------------------------------

  /** Owning organization for this webhook subscription. */
  @ManyToOne(() => Org, { inversedBy: 'webhookSubscriptions', fieldName: 'org_id', nullable: false })
  org!: Rel<Org>;

  /** All delivery attempts for this subscription. */
  @OneToMany(() => WebhookDelivery, (delivery: WebhookDelivery) => delivery.subscription, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
  })
  deliveries = new Collection<Rel<WebhookDelivery>>(this);

  // ---------------------------------------------------------------------
  // Webhook Configuration
  // ---------------------------------------------------------------------

  /**
   * Event key this webhook listens for.
   * Example: `"invoice.created"`, `"run.completed"`, `"user.updated"`.
   */
  @Property({ type: 'text' })
  event!: string;

  /** Target URL to which events are POSTed. */
  @Property({ type: 'text' })
  targetUrl!: string;

  /** Optional custom headers to include with each delivery. */
  @Property({ type: 'jsonb', nullable: true })
  headers?: Record<string, string>;

  /** Whether the webhook is currently active. */
  @Property({ type: 'boolean', default: true })
  enabled = true;
}
