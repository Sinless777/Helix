// libs/db/src/entities/system/ticket.entity.ts

import {
  Entity,
  Property,
  Index,
  ManyToOne,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { User } from '../user/user.entity';

/**
 * Enumeration of possible ticket statuses.
 */
export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'ESCALATED';

/**
 * Enumeration of ticket categories.
 */
export type TicketCategory =
  | 'BUG'
  | 'FEATURE_REQUEST'
  | 'UI_UX'
  | 'ACCOUNT'
  | 'BILLING'
  | 'PERFORMANCE'
  | 'SECURITY'
  | 'INTEGRATION'
  | 'DOCUMENTATION'
  | 'DATA'
  | 'ACCESS'
  | 'CONFIGURATION'
  | 'NETWORK'
  | 'SUPPORT'
  | 'FEEDBACK'
  | 'OTHER';

/**
 * Ticket
 *
 * Represents a user-submitted issue, feature request, or support inquiry.
 * Each ticket is owned by a {@link User} and can be filtered by category, status, or assignee.
 *
 * Table: system_ticket
 */
@Entity({ tableName: 'system_ticket' })
@Index({ name: 'idx_ticket_id', properties: ['ticketId'] })
@Index({ name: 'idx_ticket_user', properties: ['user'] })
@Index({ name: 'idx_ticket_status', properties: ['status'] })
@Index({ name: 'idx_ticket_category', properties: ['category'] })
@Index({ name: 'idx_ticket_assignee', properties: ['assigneeId'] })
export class Ticket extends BaseEntity {
  /** External or human-readable ticket identifier (e.g., "TCK-2025-0012"). */
  @Property({ type: 'text' })
  ticketId!: string;

  /** The user who created this ticket. */
  @ManyToOne(() => User, { inversedBy: 'tickets', fieldName: 'user_id', nullable: false })
  user!: Rel<User>;

  /** Short summary describing the issue or request. */
  @Property({ type: 'text' })
  title!: string;

  /** Detailed description of the issue. */
  @Property({ type: 'text' })
  description!: string;

  /** Classification of the ticket (e.g., "BUG", "FEATURE_REQUEST"). */
  @Property({ type: 'text' })
  category!: TicketCategory;

  /** Current workflow status of the ticket. */
  @Property({ type: 'text', default: 'OPEN' })
  status: TicketStatus = 'OPEN';

  /** Optional ID of the assigned handler or support agent. */
  @Property({ type: 'text', nullable: true })
  assigneeId?: string;

  /** JSON message thread for the ticket’s conversation history. */
  @Property({ type: 'jsonb', default: [] })
  conversation: Array<{ senderId: string; content: string }> = [];

  /** Timestamp (ms) when the ticket was resolved. */
  @Property({ type: 'bigint', nullable: true })
  resolvedAt?: number;
}
