// libs/db/src/entities/security/kms-key.entity.ts

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
import { Secret } from './secret.entity';

/**
 * 🔹 KmsKey
 *
 * Represents a Key Management Service (KMS) key within the Helix ecosystem.
 * Keys are used to encrypt sensitive data such as secrets, credentials, or user data.
 *
 * Can represent:
 * - AWS KMS keys
 * - GCP Cloud KMS keys
 * - Local HSM keys
 *
 * Table: security_kms_key
 */
@Entity({ tableName: 'security_kms_key' })
@Index({ name: 'idx_kms_key_org', properties: ['org'] })
@Index({ name: 'idx_kms_key_alias', properties: ['alias'] })
export class KmsKey extends BaseEntity {
  // ---------------------------------------------------------------------
  // Relationships
  // ---------------------------------------------------------------------

  /** Owning organization (multi-tenant key isolation). */
  @ManyToOne(() => Org, { inversedBy: 'kmsKeys', fieldName: 'org_id', nullable: false })
  org!: Rel<Org>;

  /** All secrets protected by this KMS key. */
  @OneToMany(() => Secret, (secret: Secret) => secret.kmsKey, {
    cascade: [Cascade.REMOVE],
  })
  secrets = new Collection<Rel<Secret>>(this);

  // ---------------------------------------------------------------------
  // Key Metadata
  // ---------------------------------------------------------------------

  /** Human-friendly alias for this key. */
  @Property({ type: 'text', unique: true })
  alias!: string;

  /**
   * Provider that manages this key.
   * Example values:
   * - "aws-kms"
   * - "gcp-kms"
   * - "local-hsm"
   */
  @Property({ type: 'text' })
  provider!: string;

  /** Arbitrary metadata (KMS ARN, version, region, etc.). */
  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
