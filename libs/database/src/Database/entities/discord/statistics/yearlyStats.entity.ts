// libs/shared/database/src/Database/entities/discord/statistics/yearlyStats.entity.ts

import { Entity, Property, OneToMany } from '@mikro-orm/core'
import { BaseEntity } from '../../base.entity'
import { DiscordMonthlyStatistics } from './monthlyStats.entity'

/**
 * Represents a yearly statistics snapshot for a Discord guild.
 *
 * Inherits UUID id, timestamps, and soft-delete from BaseEntity.
 */
@Entity({ tableName: 'discord_yearly_statistics' })
export class DiscordYearlyStatistics extends BaseEntity {
  /**
   * The calendar year (e.g., 2025).
   */
  @Property({ type: 'int', name: 'year' })
  year!: number

  /**
   * Monthly statistics records belonging to this year.
   */
  @OneToMany(() => DiscordMonthlyStatistics, (ms) => ms.yearlyStats)
  monthlyStats: DiscordMonthlyStatistics[] = []
}
