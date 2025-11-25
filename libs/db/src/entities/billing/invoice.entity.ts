// libs/db/src/entities/billing/invoice.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Cascade,
  Index,
  Unique,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Org } from '../org/org.entity';
import { User } from '../user/user.entity';
import { Customer } from './customer.entity';
import { Payment } from './payment.entity';

/** Optional: narrow status values if you like */
export type InvoiceStatus =
  | 'draft'
  | 'open'
  | 'paid'
  | 'void'
  | 'uncollectible';

@Entity({ tableName: 'billing_invoice' })
@Index({ name: 'idx_invoice_org_created', properties: ['org', 'createdAt'] })
@Index({ name: 'idx_invoice_user_created', properties: ['user', 'createdAt'] })
@Index({ name: 'idx_invoice_customer_created', properties: ['customer', 'createdAt'] })
@Unique({ name: 'uq_invoice_provider_external', properties: ['provider', 'externalId'] })
export class Invoice extends BaseEntity {
  /** Optional org tenancy scope (null when user-scoped). */
  @ManyToOne(() => Org, { fieldName: 'org_id', nullable: true })
  org?: Rel<Org>;

  /** Optional user tenancy scope (null when org-scoped). */
  @ManyToOne(() => User, { inversedBy: 'invoices', fieldName: 'user_id', nullable: true })
  user?: Rel<User>;

  /** Required link to billing customer (user- or org-backed). */
  @ManyToOne(() => Customer, {
    inversedBy: 'invoices',
    fieldName: 'customer_id',
    nullable: false,
  })
  customer!: Rel<Customer>;

  /** Billing provider (e.g., 'stripe', 'paypal'). */
  @Property({ type: 'text' })
  provider!: string;

  /** External provider invoice id. */
  @Property({ type: 'text' })
  externalId!: string;

  /** Invoice status. */
  @Property({ type: 'text' })
  status!: InvoiceStatus;

  /**
   * Monetary amount.
   * Use string to avoid JS float precision issues; stored as NUMERIC in DB.
   */
  @Property({ type: 'numeric' })
  amount!: string;

  /** ISO currency code (e.g., 'USD'). */
  @Property({ type: 'text' })
  currency!: string;

  /** Billing period window. */
  @Property({ type: 'datetime' })
  periodStart!: Date;

  @Property({ type: 'datetime' })
  periodEnd!: Date;

  /** Line items as provider-normalized JSON. */
  @Property({ type: 'jsonb', nullable: true })
  lines?: unknown;

  /** Payments associated with this invoice. */
  @OneToMany(() => Payment, (p) => p.invoice, {
    cascade: [Cascade.PERSIST],
  })
  payments = new Collection<Rel<Payment>>(this);
}
