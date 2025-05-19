// libs/shared/database/src/Database/entities/discord/statistics/dailyStats.entity.ts

import { Entity, Property, ManyToOne } from '@mikro-orm/core'
import { BaseEntity } from '../../base.entity'
import { DiscordWeeklyStatistics } from './weeklyStats.entity'

/**
 * Daily statistics snapshot for a Discord guild.
 *
 * Inherits UUID id, timestamps, and soft-delete from BaseEntity.
 */
@Entity({ tableName: 'discord_daily_statistics' })
export class DiscordDailyStatistics extends BaseEntity {
  /**
   * Snowflake ID of the guild this snapshot belongs to.
   */
  @Property({ type: 'text', name: 'guild_id' })
  guildId!: string

  /** Total number of kicks recorded. */
  @Property({ type: 'int' })
  kicks!: number

  /** Total number of warnings issued. */
  @Property({ type: 'int' })
  warnings!: number

  /** Total number of bans applied. */
  @Property({ type: 'int' })
  bans!: number

  /** Count of text channels and categories. */
  @Property({ type: 'int', name: 'channel_count' })
  channels!: number

  /** Total number of emojis in use. */
  @Property({ type: 'int' })
  emojis!: number

  /** Total number of stickers in use. */
  @Property({ type: 'int' })
  stickers!: number

  /** Total number of members in the guild. */
  @Property({ type: 'int' })
  members!: number

  /** Total number of roles defined. */
  @Property({ type: 'int' })
  roles!: number

  /** Total number of bots present. */
  @Property({ type: 'int' })
  bots!: number

  /**
   * Reference to the parent weekly statistics record.
   */
  @ManyToOne(() => DiscordWeeklyStatistics, { name: 'weekly_stats_id' })
  weeklyStats!: DiscordWeeklyStatistics
}
