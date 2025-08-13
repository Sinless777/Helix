import { Entity, PrimaryKey, Property, Enum, Index, Unique } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';
import { Cefr } from '../enums/cefr.enum';
import { PreferenceSentiment } from '../enums/preference-sentiment.enum';

/**
 * UserLanguage
 * - One row per user + BCP-47 language tag (e.g., "en", "en-US", "pt-BR").
 * - CEFR proficiency overall, plus optional per-modality levels.
 * - `isPrimary` marks the preferred language for UI/comms.
 */
@Entity({ tableName: 'user_language' })
@Unique({ properties: ['userId', 'tag'] })
@Index({ properties: ['userId'] })
@Index({ properties: ['isPrimary'] })
@Index({ properties: ['createdAt'] })
export class UserLanguage {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  /** Owning user */
  @Property({ type: 'uuid' })
  userId!: string;

  /**
   * BCP-47 language tag, e.g., "en", "en-US", "es-419".
   * Store as provided by client after your own normalization step.
   */
  @Property({ length: 56 })
  tag!: string;

  /** Mark the user's preferred/primary language for UI or communications. */
  @Property({ default: false })
  isPrimary: boolean = false;

  /** Optional preference signal (like/dislike/neutral). */
  @Enum({ items: () => PreferenceSentiment, nullable: true, type: 'string' })
  sentiment?: PreferenceSentiment | null;

  // ── Proficiency (CEFR) ─────────────────────────────────────────────────

  /** Overall proficiency level (A1→C2, or 'native'). */
  @Enum({ items: () => Cefr, type: 'string' })
  proficiencyOverall!: Cefr;

  /** Optional per-modality levels (fallback to overall if null in your code). */
  @Enum({ items: () => Cefr, nullable: true, type: 'string' })
  proficiencyReading?: Cefr | null;

  @Enum({ items: () => Cefr, nullable: true, type: 'string' })
  proficiencyWriting?: Cefr | null;

  @Enum({ items: () => Cefr, nullable: true, type: 'string' })
  proficiencySpeaking?: Cefr | null;

  @Enum({ items: () => Cefr, nullable: true, type: 'string' })
  proficiencyListening?: Cefr | null;

  /** Free-form notes (e.g., domains like “technical”, “casual”, “business”). */
  @Property({ nullable: true })
  notes?: string | null;

  /** Source of this row (e.g., "user", "import", "detected"). */
  @Property({ nullable: true })
  source?: string | null;

  /** Timestamps */
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ nullable: true, onUpdate: () => new Date() })
  updatedAt?: Date;

  // ── Derived helpers (not persisted) ────────────────────────────────────

  /** True if overall is 'native'. */
  @Property({ persist: false })
  get isNative(): boolean {
    return this.proficiencyOverall === Cefr.native;
  }

  /** Best (max) proficiency across modalities, falling back to overall. */
  @Property({ persist: false })
  get bestModality(): Cefr {
    const vals = [
      this.proficiencyReading,
      this.proficiencyWriting,
      this.proficiencySpeaking,
      this.proficiencyListening,
      this.proficiencyOverall,
    ].filter(Boolean) as Cefr[];
    // Simple max by CEFR ordering; native assumed highest.
    const order: Record<Cefr, number> = {
      A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5, native: 6,
    };
    return vals.reduce((a, b) => (order[b] > order[a] ? b : a), vals[0] ?? this.proficiencyOverall);
  }
}

/*
Migration notes (Cockroach/Postgres):

-- Optional DB enums for CEFR and sentiment (or keep TEXT):
-- CREATE TYPE cefr_enum AS ENUM ('A1','A2','B1','B2','C1','C2','native');
-- CREATE TYPE preference_enum AS ENUM ('like','dislike','neutral');
-- ALTER TABLE user_language ALTER COLUMN proficiency_overall TYPE cefr_enum USING proficiency_overall::cefr_enum;
-- ALTER TABLE user_language ALTER COLUMN proficiency_reading TYPE cefr_enum USING proficiency_reading::cefr_enum;
-- ALTER TABLE user_language ALTER COLUMN proficiency_writing TYPE cefr_enum USING proficiency_writing::cefr_enum;
-- ALTER TABLE user_language ALTER COLUMN proficiency_speaking TYPE cefr_enum USING proficiency_speaking::cefr_enum;
-- ALTER TABLE user_language ALTER COLUMN proficiency_listening TYPE cefr_enum USING proficiency_listening::cefr_enum;
-- ALTER TABLE user_language ALTER COLUMN sentiment TYPE preference_enum USING sentiment::preference_enum;

-- Helpful composite index when listing languages for a user with primary-first:
-- CREATE INDEX IF NOT EXISTS idx_user_language_user_primary ON user_language (userId, isPrimary DESC, createdAt DESC);
*/
