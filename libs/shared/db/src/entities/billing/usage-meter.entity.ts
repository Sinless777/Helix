// libs/db/src/entities/billing/usage-meter.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  Index,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Org } from '../org/org.entity';

/**
 * 🔹 UsageMeter
 *
 * Tracks quantitative metric usage for billing and analytics.
 * Each record corresponds to a unique metric + dimensions set
 * for a given organization and date.
 *
 * Table: billing_usage_meter
 */
@Entity({ tableName: 'billing_usage_meter' })
@Index({ name: 'idx_usage_org_metric_date', properties: ['org', 'metricCode', 'forDate'] })
@Index({ name: 'idx_usage_metric_hash', properties: ['dimensionsHash'] })
export class UsageMeter extends BaseEntity {
  // ---------------------------------------------------------------------
  // Relationships
  // ---------------------------------------------------------------------

  /** The organization whose usage this record measures. */
  @ManyToOne(() => Org, { inversedBy: 'usageMeters', fieldName: 'org_id', nullable: false })
  org!: Rel<Org>;

  // ---------------------------------------------------------------------
  // Metric Details
  // ---------------------------------------------------------------------

  /**
   * Metric code identifying what is being measured.
   * Examples: `"llm_tokens"`, `"webhooks_fired"`, `"api_calls"`.
   */
  @Property({ type: 'text' })
  metricCode!: string;

  /**
   * Quantity consumed for the given metric.
   * Typically represents cumulative daily usage.
   */
  @Property({ type: 'bigint', defaultRaw: '0' })
  quantity!: bigint;

  /**
   * UTC date (YYYY-MM-DD) for which this usage record applies.
   * Used as a daily aggregation key.
   */
  @Property({ type: 'date' })
  forDate!: Date;

  /**
   * JSON object defining usage segmentation or filters.
   * Example: `{ "region": "us-west", "model": "gpt-5" }`
   */
  @Property({ type: 'jsonb', nullable: true })
  dimensions?: Record<string, unknown>;

  /**
   * Deterministic hash (e.g., SHA256) of the dimensions JSON.
   * Used for deduplication and efficient lookups.
   */
  @Property({ type: 'text', nullable: true })
  dimensionsHash?: string;
}
