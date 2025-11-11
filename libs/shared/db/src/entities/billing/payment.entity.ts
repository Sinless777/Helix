// libs/db/src/entities/billing/payment.entity.ts

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
import { User } from '../user/user.entity';
import { Customer } from './customer.entity';
import { Invoice } from './invoice.entity';

export type PaymentStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded';

/**
 * Payment
 * Table: billing_payment
 */
@Entity({ tableName: 'billing_payment' })
@Index({ name: 'idx_payment_org_created', properties: ['org', 'createdAt'] })
@Index({ name: 'idx_payment_user_created', properties: ['user', 'createdAt'] })
@Index({ name: 'idx_payment_customer_created', properties: ['customer', 'createdAt'] })
@Index({ name: 'idx_payment_invoice_created', properties: ['invoice', 'createdAt'] })
@Unique({ name: 'uq_payment_provider_external', properties: ['provider', 'externalId'] })
export class Payment extends BaseEntity {
  /** Optional org tenancy scope (null when user-scoped). */
  @ManyToOne(() => Org, { fieldName: 'org_id', nullable: true })
  org?: Rel<Org>;

  /** Optional user tenancy scope (null when org-scoped). */
  @ManyToOne(() => User, { inversedBy: 'payments', fieldName: 'user_id', nullable: true })
  user?: Rel<User>;

  /** Required link to billing customer (user- or org-backed). */
  @ManyToOne(() => Customer, {
    inversedBy: 'payments',
    fieldName: 'customer_id',
    nullable: false,
  })
  customer!: Rel<Customer>;
  /** Optional link to an invoice this payment is for. */
  @ManyToOne(() => Invoice, {
    inversedBy: 'payments',
    fieldName: 'invoice_id',
    nullable: true,
  })
  invoice?: Rel<Invoice>;

  /** Billing provider (e.g., 'stripe', 'paypal'). */
  @Property({ type: 'text' })
  provider!: string;

  /** External provider payment id. */
  @Property({ type: 'text' })
  externalId!: string;

  /** Payment status. */
  @Property({ type: 'text' })
  status!: PaymentStatus;

  /**
   * Monetary amount (precision-safe).
   * Store as NUMERIC in DB; keep as string in code.
   */
  @Property({ type: 'numeric' })
  amount!: string;

  /** ISO currency code (e.g., 'USD'). */
  @Property({ type: 'text' })
  currency!: string;

  /** Provider method details (card brand, last4, wallet, etc.). */
  @Property({ type: 'jsonb', nullable: true })
  methodDetails?: unknown;

  /** Arbitrary metadata from app or provider. */
  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  /** When the payment was captured/settled (if applicable). */
  @Property({ type: 'datetime', nullable: true })
  capturedAt?: Date;

  /** When a refund was processed (if applicable). */
  @Property({ type: 'datetime', nullable: true })
  refundedAt?: Date;
}
