// libs/shared/database/src/Database/entities/discord/statistics/monthlyStats.entity.ts

import { Entity, Property, OneToMany, ManyToOne } from '@mikro-orm/core'
import { BaseEntity } from '../../base.entity'
import { DiscordWeeklyStatistics } from './weeklyStats.entity'
import { DiscordYearlyStatistics } from './yearlyStats.entity'

/**
 * Represents a monthly statistics snapshot for a Discord guild.
 *
 * Inherits UUID id, timestamps, and soft‑delete from BaseEntity.
 */
@Entity({ tableName: 'discord_monthly_statistics' })
export class DiscordMonthlyStatistics extends BaseEntity {
  /**
   * Month of the year (1–12).
   */
  @Property({ type: 'int', name: 'month' })
  month!: number

  /**
   * Weekly statistics records belonging to this month.
   */
  @OneToMany(() => DiscordWeeklyStatistics, (ws) => ws.monthlyStats)
  weeklyStats: DiscordWeeklyStatistics[] = []

  /**
   * Reference to the parent yearly statistics record.
   * Column: yearly_stats_id
   */
  @ManyToOne(() => DiscordYearlyStatistics, { name: 'yearly_stats_id' })
  yearlyStats!: DiscordYearlyStatistics
}
