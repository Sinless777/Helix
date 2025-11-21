// libs/db/src/entities/assistant/message.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  Index,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Conversation } from './conversation.entity';

/** Allowed chat roles (aligns with your ERD). */
export type MessageRole = 'user' | 'assistant' | 'tool' | 'system';

/**
 * Assistant Message
 *
 * A single message within a Conversation. Can include tool call metadata
 * and attachment descriptors for downstream processing.
 *
 * Table: assistant_message
 */
@Entity({ tableName: 'assistant_message' })
@Index({ name: 'idx_message_conversation', properties: ['conversation'] })
@Index({ name: 'idx_message_conversation_created', properties: ['conversation', 'createdAt'] })
@Index({ name: 'idx_message_role', properties: ['role'] })
export class Message extends BaseEntity {
  /** Parent conversation (tenant scope inherited via conversation → org). */
  @ManyToOne(() => Conversation, { inversedBy: 'messages', fieldName: 'conversation_id', nullable: false })
  conversation!: Rel<Conversation>;

  /** Message role (user/assistant/tool/system). */
  @Property({ type: 'text' })
  role!: MessageRole;

  /** Primary content payload (plain text or serialized markdown). */
  @Property({ type: 'text' })
  content!: string;

  /**
   * Tool call metadata recorded by the assistant (if any).
   * Example: [{ id, name, args, resultRef }]
   */
  @Property({ type: 'jsonb', nullable: true })
  toolCalls?: unknown;

  /**
   * Attachment descriptors (blobs, URLs, vector refs, etc.).
   * Example: [{ kind: 'url', uri, mime, title }]
   */
  @Property({ type: 'jsonb', nullable: true })
  attachments?: unknown;

  /** Optional model identifier used for this message (e.g., "gpt-5"). */
  @Property({ type: 'text', nullable: true })
  model?: string;
}
