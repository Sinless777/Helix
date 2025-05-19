// libs/shared/database/src/Database/entities/discord/statistics/weeklyStats.entity.ts

import { Entity, Property, OneToMany, ManyToOne } from '@mikro-orm/core'
import { BaseEntity } from '../../base.entity'
import { DiscordDailyStatistics } from './dailyStats.entity'
import { DiscordMonthlyStatistics } from './monthlyStats.entity'

/**
 * Represents a weekly statistics snapshot for a Discord guild.
 *
 * Inherits UUID id, timestamps, and soft-delete from BaseEntity.
 */
@Entity({ tableName: 'discord_weekly_statistics' })
export class DiscordWeeklyStatistics extends BaseEntity {
  /**
   * ISO week number within the year (1–53).
   */
  @Property({ type: 'int', name: 'week' })
  week!: number

  /**
   * Daily statistics records belonging to this week.
   */
  @OneToMany(() => DiscordDailyStatistics, (ds) => ds.weeklyStats)
  dailyStats: DiscordDailyStatistics[] = []

  /**
   * Reference to the parent monthly statistics record.
   * Column: monthly_stats_id
   */
  @ManyToOne(() => DiscordMonthlyStatistics, { name: 'monthly_stats_id' })
  monthlyStats!: DiscordMonthlyStatistics
}
