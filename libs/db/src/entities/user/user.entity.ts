// libs/db/src/entities/user/user.entity.ts

import {
  Entity,
  Property,
  OneToOne,
  OneToMany,
  Collection,
  Cascade,
  Index,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';

// ---- Related entities (align with your ERD & file layout) ----
import { UserProfile } from './profile.entity';
import { UserSettings } from './settings.entity';
import { UserAccount } from './account.entity';
import { UserSession } from './session.entity';
import { UserVerificationToken } from './verification-token.entity';
import { ApiKey } from '../system/api-key.entity';
import { Ticket } from '../system/ticket.entity';
import { Notification } from '../system/notification.entity';
import { Invoice } from'../billing/invoice.entity';
import { Payment } from '../billing/payment.entity';
import { OrgMember } from '../org/org-member.entity';
import { Conversation } from '../assistant/conversation.entity';
import { Customer } from '../billing/customer.entity';
import { WaitlistEntry } from '../growth/waitlist.entity';

/**
 * Application user (table: app_user)
 */
@Entity({ tableName: 'app_user' })
@Index({ name: 'uq_user_email', properties: ['email'], options: { unique: true } })
export class User extends BaseEntity {
  // ---------------------------------------------------------------------
  // Core fields (match ERD)
  // ---------------------------------------------------------------------

  @Property({ type: 'text' })
  email!: string;

  @Property({ type: 'text' })
  displayName!: string;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>;

  // ---------------------------------------------------------------------
  // One-to-one (inverse sides): Profile & Settings
  // Owning side lives on the child table with unique userId FK.
  // ---------------------------------------------------------------------

  @OneToOne(() => UserProfile, (p) => p.user, {
    nullable: true,
    eager: true,
  })
  profile?: Rel<UserProfile>;

  @OneToOne(() => UserSettings, (s) => s.user, {
    nullable: true,
    eager: false,
  })
  settings?: Rel<UserSettings>;

  @OneToMany(() => UserAccount, (a) => a.user)
  accounts?: Rel<UserAccount>;

  @OneToMany(() => UserSession, (s) => s.user)
  sessions?: Rel<UserSession>;

  @OneToMany(() => UserVerificationToken, (t) => t.user, { cascade: [Cascade.PERSIST, Cascade.REMOVE] })
  verificationTokens = new Collection<Rel<UserVerificationToken>>(this);


  // ---------------------------------------------------------------------
  // One-to-many collections (userId on child rows)
  // ---------------------------------------------------------------------

  /** User’s API keys (user-scoped; org-scoped keys live without userId). */
  @OneToMany(() => ApiKey, (k) => k.user, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
    orphanRemoval: true,
  })
  apiKeys = new Collection<Rel<ApiKey>>(this);

  /** User’s invoices (billed to this user as a customer or via org). */
  @OneToMany(() => Invoice, (i) => i.user)
  invoices = new Collection<Rel<Invoice>>(this);

  /** User’s payments (purchases/captures associated to invoices). */
  @OneToMany(() => Payment, (p) => p.user)
  payments = new Collection<Rel<Payment>>(this);

  /** Organization memberships for this user. */
  @OneToMany(() => OrgMember, (m) => m.user, {
    cascade: [Cascade.PERSIST],
  })
  memberships = new Collection<Rel<OrgMember>>(this);

  /** Conversations initiated/owned by this user. */
  @OneToMany(() => Conversation, (c) => c.user)
  conversations = new Collection<Rel<Conversation>>(this);

  /**
   * Customer records for this user (usually 0–N per billing provider).
   * Exactly one of (customer.userId, customer.orgId) is set.
   */
  @OneToMany(() => Customer, (c) => c.user)
  customers = new Collection<Rel<Customer>>(this);

  /** Any waitlist entries later “claimed” by this user. */
  @OneToMany(() => WaitlistEntry, (w) => w.user)
  waitlistEntries = new Collection<Rel<WaitlistEntry>>(this);

  /** Notifications sent to this user. */
  @OneToMany(() => Notification, (n) => n.user, {
      cascade: [Cascade.PERSIST, Cascade.REMOVE],
  })
  notifications = new Collection<Rel<Notification>>(this);

  @OneToMany(() => Ticket, (t) => t.user, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
  })
  tickets = new Collection<Rel<Ticket>>(this);
}
