import { Entity, PrimaryKey, Property, Enum, Index, Unique } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';
import { PreferenceSentiment, PREFERENCE_SENTIMENT_SCORE } from '../enums/preference-sentiment.enum';

/**
 * UserPreference
 * - One row per (userId, namespace, key, value)
 * - sentiment: like | dislike | neutral
 * - weight: small multiplier to bias ranking (default 1)
 * - confidence: 0..100 (percentage) to reflect certainty/inference quality
 * - tag (optional): BCP-47 language tag if preference is language-specific (e.g., content locale)
 */
@Entity({ tableName: 'user_preference' })
@Unique({ properties: ['userId', 'namespace', 'key', 'value'] })
@Index({ properties: ['userId'] })
@Index({ properties: ['userId', 'namespace'] })
@Index({ properties: ['userId', 'sentiment'] })
@Index({ properties: ['createdAt'] })
export class UserPreference {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  /** Owning user */
  @Property({ type: 'uuid' })
  userId!: string;

  /**
   * Optional org/tenant scope if your app wants org-specific preferences.
   * Keep nullable to allow global/user-only prefs.
   */
  @Property({ type: 'uuid', nullable: true })
  orgId?: string | null;

  /** Logical bucket (e.g., "music", "food", "sports", "content", "persona", "general"). */
  @Property({ length: 32, default: 'general' })
  namespace: string = 'general';

  /** Key within a namespace (e.g., "artist", "cuisine", "team", "genre", "topic", "brand"). */
  @Property({ length: 64 })
  key!: string;

  /** Concrete value (normalized, lowercased by setter). */
  @Property({ length: 256 })
  value!: string;

  /** Optional BCP-47 tag if the preference is language-scoped (e.g., "en", "es-419"). */
  @Property({ length: 56, nullable: true })
  tag?: string | null;

  /** like | dislike | neutral */
  @Enum({ items: () => PreferenceSentiment, type: 'string' })
  sentiment: PreferenceSentiment = PreferenceSentiment.neutral;

  /** Small positive integer multiplier (default 1). */
  @Property({ type: 'smallint', default: 1 })
  weight: number = 1;

  /** Confidence in 0..100 (percent). Store as SMALLINT for cheap comparisons. */
  @Property({ type: 'smallint', default: 100 })
  confidence: number = 100;

  /** Free-form tags (e.g., "spicy", "instrumental", "sci-fi"). */
  @Property({ type: 'text[]', nullable: true })
  tags?: string[] | null;

  /** Source of this preference: "user", "import", "inferred", "interaction", "survey", etc. */
  @Property({ length: 32, nullable: true })
  source?: string | null;

  /** Rich context (time, location, device, season, campaign, etc.). */
  @Property({ type: 'json', nullable: true })
  context?: Record<string, unknown> | null;

  /** Arbitrary metadata (debug fields, notes, etc.). */
  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown> | null;

  /** Lifecycle / usage */
  @Property({ nullable: true })
  lastObservedAt?: Date | null;

  @Property({ nullable: true })
  expiresAt?: Date | null;

  @Property({ nullable: true })
  revokedAt?: Date | null;

  /** Timestamps */
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ nullable: true, onUpdate: () => new Date() })
  updatedAt?: Date;

  // ─────────────── Derived helpers (not persisted) ───────────────

  @Property({ persist: false })
  get score(): number {
    // sentiment (-1, 0, 1) * weight * (confidence as 0..1)
    const s = PREFERENCE_SENTIMENT_SCORE[this.sentiment] ?? 0;
    const conf = Math.max(0, Math.min(100, this.confidence)) / 100;
    return s * this.weight * conf;
  }

  @Property({ persist: false })
  get label(): string {
    return `${this.namespace}:${this.key}=${this.value}`;
  }

  // ─────────────── Domain helpers ───────────────

  /** Normalize and set the (key, value) pair — trims and lowercases value. */
  setPair(key: string, value: string): void {
    this.key = String(key).trim();
    this.value = String(value).trim().toLowerCase();
  }

  /** Convenience to bump lastObservedAt (e.g., after an interaction). */
  touch(now = new Date()): void {
    this.lastObservedAt = now;
  }

  /** Revoke this preference (stop considering it). */
  revoke(when = new Date()): void {
    this.revokedAt = when;
  }
}
