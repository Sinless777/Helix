// libs/db/src/entities/assistant/conversation.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  OneToMany,
  Index,
  Cascade,
  Collection,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Org } from '../org/org.entity';
import { User } from '../user/user.entity';
import { Message } from './message.entity';
import { Run } from './run.entity';

/**
 * 🔹 Conversation
 *
 * Represents a persisted chat or interaction session between a user
 * and the Helix Assistant (or other automations). Each conversation
 * may include multiple {@link Message} entries and linked {@link Run}
 * executions for AI-driven tool use.
 *
 * Table: `assistant_conversation`
 */
@Entity({ tableName: 'assistant_conversation' })
@Index({ name: 'idx_conversation_org', properties: ['org'] })
@Index({ name: 'idx_conversation_user', properties: ['user'] })
@Index({ name: 'idx_conversation_created', properties: ['createdAt'] })
export class Conversation extends BaseEntity {
  // ---------------------------------------------------------------------
  // Relationships
  // ---------------------------------------------------------------------

  /** Organization context for the conversation (multi-tenant scope). */
  @ManyToOne(() => Org, { inversedBy: 'conversations', fieldName: 'org_id', nullable: false })
  org!: Rel<Org>;

  /** The user who initiated or owns this conversation. */
  @ManyToOne(() => User, { inversedBy: 'conversations', fieldName: 'user_id', nullable: false })
  user!: Rel<User>;

  /** Messages in this conversation (chat entries). */
  @OneToMany(() => Message, (m) => m.conversation, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
  })
  messages = new Collection<Rel<Message>>(this);

  /** All execution runs (e.g., tool or agent calls) associated with this conversation. */
  @OneToMany(() => Run, (r) => r.conversation, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
  })
  runs = new Collection<Rel<Run>>(this);

  // ---------------------------------------------------------------------
  // Core Conversation Fields
  // ---------------------------------------------------------------------

  /** User-defined or system-generated conversation title. */
  @Property({ type: 'text', nullable: true })
  title?: string;

  /** Metadata for context, system prompts, or UI state. */
  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

}
