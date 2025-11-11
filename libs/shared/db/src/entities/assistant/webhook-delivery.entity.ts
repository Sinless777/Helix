// libs/db/src/entities/assistant/webhook-delivery.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  Index,
  Unique,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Org } from '../org/org.entity';
import { WebhookSubscription } from './webhook-subscription.entity';

/**
 * WebhookDelivery
 *
 * A single delivery attempt for a {@link WebhookSubscription}.
 * Tracks attempt count, response status, and idempotency key.
 *
 * Table: assistant_webhook_delivery
 */
@Entity({ tableName: 'assistant_webhook_delivery' })
@Index({ name: 'idx_webhook_delivery_org_created', properties: ['org', 'createdAt'] })
@Index({ name: 'idx_webhook_delivery_subscription_created', properties: ['subscription', 'createdAt'] })
@Unique({ name: 'uq_webhook_delivery_idempotency', properties: ['idempotencyKey'] })
export class WebhookDelivery extends BaseEntity {
  /** Tenant scope. */
  @ManyToOne(() => Org, { inversedBy: 'webhookDeliveries', fieldName: 'org_id', nullable: false })
  org!: Rel<Org>;

  /** Parent subscription for this delivery attempt. */
  @ManyToOne(() => WebhookSubscription, { inversedBy: 'deliveries', fieldName: 'subscription_id', nullable: false })
  subscription!: Rel<WebhookSubscription>;

  @Property({ type: 'text' })
  status!: string;

  /** Attempt count starting from 1. */
  @Property({ type: 'int' })
  attempt!: number;

  /** HTTP response code from the target endpoint (0 if not attempted). */
  @Property({ type: 'int', default: 0 })
  responseCode = 0;

  /**
   * Idempotency key to deduplicate deliveries.
   * Typically derived from event id + subscription id + attempt or a GUID.
   */
  @Property({ type: 'text' })
  idempotencyKey!: string;

  /** Optional error message if a failure occurred. */
  @Property({ type: 'text', nullable: true })
  errorMessage?: string;

  /** Optional response headers/body for debugging/auditing. */
  @Property({ type: 'jsonb', nullable: true })
  response?: unknown;

  /** Optional request payload snapshot for replay/debugging. */
  @Property({ type: 'jsonb', nullable: true })
  request?: unknown;

  /** Duration of the HTTP attempt in milliseconds (if measured). */
  @Property({ type: 'float', nullable: true })
  durationMs?: number;
}

