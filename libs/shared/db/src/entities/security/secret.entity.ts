// libs/db/src/entities/security/secret.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  Index,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Org } from '../org/org.entity';
import { KmsKey } from './kms-key.entity';

/**
 * 🔹 Secret
 *
 * Represents an encrypted value managed by the Helix KMS.
 * Secrets can store API keys, credentials, or sensitive tokens.
 * Each secret is encrypted under a {@link KmsKey} and scoped to an {@link Org}.
 *
 * Table: security_secret
 */
@Entity({ tableName: 'security_secret' })
@Index({ name: 'idx_secret_org', properties: ['org'] })
@Index({ name: 'idx_secret_kms_key', properties: ['kmsKey'] })
export class Secret extends BaseEntity {
  // ---------------------------------------------------------------------
  // Relationships
  // ---------------------------------------------------------------------

  /** Owning organization for this secret. */
  @ManyToOne(() => Org, { inversedBy: 'secrets', fieldName: 'org_id', nullable: false })
  org!: Rel<Org>;

  /**
   * The KMS key protecting this secret.
   * If the key is rotated, the secret should be re-encrypted.
  /**
   * The KMS key protecting this secret.
   * If the key is rotated, the secret should be re-encrypted.
   */
  @ManyToOne(() => KmsKey, { inversedBy: 'secrets', fieldName: 'kms_key_id', nullable: false })
  kmsKey!: Rel<KmsKey>;
  // ---------------------------------------------------------------------

  /** Binary ciphertext of the encrypted secret value. */
  @Property({ type: 'blob' })
  ciphertext!: Buffer;

  /** Optional alias for referencing the key used in encryption. */
  @Property({ type: 'text', nullable: true })
  kmsKeyAlias?: string;

  // ---------------------------------------------------------------------
  // Rotation & Audit
  // ---------------------------------------------------------------------

  /** Timestamp of last rotation or re-encryption. */
  @Property({ type: 'datetime', nullable: true })
  rotatedAt?: Date;
}
