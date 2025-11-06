// libs/db/src/entities/billing/customer.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Cascade,
  Index,
  Unique,
  Check,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Org } from '../org/org.entity';
import { User } from '../user/user.entity';
import { Invoice } from './invoice.entity';
import { Payment } from './payment.entity';

/**
 * Customer
 *
 * Represents a billable entity in a payment provider (Stripe/PayPal).
 * Exactly one of (org, user) must be set (enforced via CHECK constraint).
 *
 * Table: billing_customer
 */
@Entity({ tableName: 'billing_customer' })
@Index({ name: 'idx_customer_org', properties: ['org'] })
@Index({ name: 'idx_customer_user', properties: ['user'] })
@Unique({ name: 'uq_customer_provider_external', properties: ['provider', 'externalId'] })
@Check({ name: 'ck_customer_one_side', expression: '(org_id IS NULL) <> (user_id IS NULL)' })
export class Customer extends BaseEntity {
  /** Owning org when org-scoped (null when user-scoped). */
  @ManyToOne(() => Org, { fieldName: 'org_id', nullable: true })
  org?: Rel<Org>;

  /** Owning user when user-scoped (null when org-scoped). */
  @ManyToOne(() => User, { inversedBy: 'customers', fieldName: 'user_id', nullable: true })
  user?: Rel<User>;

  /** Billing provider (e.g., 'stripe', 'paypal'). */
  @Property({ type: 'text' })
  provider!: string;

  /** External provider customer id. */
  @Property({ type: 'text' })
  externalId!: string;

  /** Contact endpoints for billing ops (emails, webhooks, etc.). */
  @Property({ type: 'jsonb', nullable: true })
  billingContacts?: unknown;

  /** Arbitrary metadata from app or provider. */
  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  /** Invoices associated with this customer. */
  @OneToMany(() => Invoice, (i) => i.customer, {
    cascade: [Cascade.PERSIST],
  })
  invoices = new Collection<Rel<Invoice>>(this);

  /** Payments associated with this customer. */
  @OneToMany(() => Payment, (p) => p.customer, {
    cascade: [Cascade.PERSIST],
  })
  payments = new Collection<Rel<Payment>>(this);
}
