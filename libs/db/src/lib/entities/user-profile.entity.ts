import { Entity, PrimaryKey, Property, Enum, Unique, Index } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';
import { Iso5218Sex } from '../enums/iso5218-sex.enum';
import { Gender } from '../enums/gender.enum';

/**
 * One profile per user.
 * - Uses ISO 5218 for "sex" (biological classification).
 * - Uses inclusive Gender enum for gender identity.
 * - Locale and language tags are BCP-47 strings (e.g., "en-US", "es-419").
 * - Likes/dislikes are quick tags; your richer signals live in user_preference.
 */
@Entity({ tableName: 'user_profile' })
@Unique({ properties: ['userId'] })
@Index({ properties: ['alias'] })
@Index({ properties: ['locale'] })
@Index({ properties: ['sex'] })
@Index({ properties: ['gender'] })
@Index({ properties: ['birthdate'] })
@Index({ properties: ['createdAt'] })
export class UserProfile {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  /** Owning user (FK by UUID; relation can be added later). */
  @Property({ type: 'uuid' })
  userId!: string;

  // ── Name / addressing ───────────────────────────────────────────────────────

  /** Given/first name */
  @Property({ nullable: true })
  firstName?: string | null;

  /** Family/last name */
  @Property({ nullable: true })
  lastName?: string | null;

  /**
   * What the user wants to be addressed as in the UI (preferred name / alias).
   * Use this for greetings, chat attribution, etc.
   */
  @Property({ nullable: true })
  alias?: string | null;

  // ── Identity ────────────────────────────────────────────────────────────────

  /** ISO 5218 sex (unknown/male/female/not_applicable) */
  @Enum({ items: () => Iso5218Sex, type: 'string', nullable: true })
  sex?: Iso5218Sex | null;

  /** Gender identity (inclusive, may be 'self_described') */
  @Enum({ items: () => Gender, type: 'string', nullable: true })
  gender?: Gender | null;

  /** If gender is self-described or user provided a custom label, store it here. */
  @Property({ nullable: true })
  genderSelfDescription?: string | null;

  // ── Locale & languages ─────────────────────────────────────────────────────

  /**
   * UI/content locale preference (BCP-47), e.g., "en-US".
   * Keep separate from primaryLanguageTag (which is language only).
   */
  @Property({ length: 56, nullable: true })
  locale?: string | null;

  /** Primary language tag (BCP-47), e.g., "en", "en-GB" (denormalized from user_language). */
  @Property({ length: 56, nullable: true })
  primaryLanguageTag?: string | null;

  /** Other language tags the user speaks/reads (lightweight denormalization). */
  @Property({ type: 'text[]', nullable: true })
  otherLanguageTags?: string[] | null;

  // ── Preferences (lightweight tags; use user_preference for rich data) ──────

  @Property({ type: 'text[]', nullable: true })
  likes?: string[] | null;

  @Property({ type: 'text[]', nullable: true })
  dislikes?: string[] | null;

  // ── Birthdate & derived age ────────────────────────────────────────────────

  @Property({ nullable: true })
  birthdate?: Date | null;

  // ── Misc ───────────────────────────────────────────────────────────────────

  /** Arbitrary per-user profile metadata */
  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown> | null;

  /** Timestamps */
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ nullable: true, onUpdate: () => new Date() })
  updatedAt?: Date;

  // ── Derived helpers (not persisted) ────────────────────────────────────────

  /** Age computed from birthdate at request time; null if unknown. */
  @Property({ persist: false })
  get age(): number | null {
    if (!this.birthdate) return null;
    const today = new Date();
    let age = today.getUTCFullYear() - this.birthdate.getUTCFullYear();
    const m = today.getUTCMonth() - this.birthdate.getUTCMonth();
    if (m < 0 || (m === 0 && today.getUTCDate() < this.birthdate.getUTCDate())) {
      age -= 1;
    }
    return age;
  }

  /** "Alias" first; otherwise "First Last" or just first/last that exist. */
  @Property({ persist: false })
  get displayName(): string | null {
    if (this.alias && this.alias.trim()) return this.alias.trim();
    const parts = [this.firstName, this.lastName].filter(Boolean) as string[];
    return parts.length ? parts.join(' ') : null;
  }

  /** Useful for personalization: condensed identity string. */
  @Property({ persist: false })
  get summary(): string {
    const who = this.displayName ?? 'User';
    const lang = this.primaryLanguageTag ?? this.locale ?? 'und';
    const gender = this.gender ?? 'unspecified';
    return `${who} · ${gender} · ${lang}`;
  }
}

/*
Migration notes (Cockroach/Postgres):

-- Optional enums (or keep TEXT):
-- CREATE TYPE iso5218_enum AS ENUM ('unknown','male','female','not_applicable');
-- CREATE TYPE gender_enum AS ENUM (
--   'man','woman','non_binary','agender','genderqueer','genderfluid','bigender',
--   'trans','trans_man','trans_woman','two_spirit','questioning','prefer_not_to_say',
--   'self_described','male','female'  -- includes alias entries defined in code
-- );
-- ALTER TABLE user_profile ALTER COLUMN sex TYPE iso5218_enum USING sex::iso5218_enum;
-- ALTER TABLE user_profile ALTER COLUMN gender TYPE gender_enum USING gender::gender_enum;

-- If you expect heavy queries on language tags/arrays, consider inverted indexes:
-- CREATE INVERTED INDEX IF NOT EXISTS idx_user_profile_other_langs ON user_profile (otherLanguageTags);
*/
