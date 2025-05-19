// Import all entities and export them in two different ways
import {
  Microservice,
  News,
  Technology,
  User,
  UserProfile,
  UserSetting,
  Account,
  Session,
  DiscordGuild,
  DiscordUser,
  DiscordDailyStatistics,
  DiscordWeeklyStatistics,
  DiscordMonthlyStatistics,
  DiscordYearlyStatistics,
  Pastebin,
  Image,
  Health,
  BaseEntity,
} from './entities'

/**
 * Entities export
 *
 * @description Export all entities
 */
export const entities = [
  Microservice,
  News,
  Technology,
  User,
  UserProfile,
  UserSetting,
  Account,
  Session,
  DiscordGuild,
  DiscordUser,
  DiscordDailyStatistics,
  DiscordWeeklyStatistics,
  DiscordMonthlyStatistics,
  DiscordYearlyStatistics,
  Pastebin,
  Image,
  Health,
  BaseEntity,
]

export {
  Microservice,
  News,
  Technology,
  User,
  UserProfile,
  UserSetting,
  Account,
  Session,
  DiscordGuild,
  DiscordUser,
  DiscordDailyStatistics,
  DiscordWeeklyStatistics,
  DiscordMonthlyStatistics,
  DiscordYearlyStatistics,
  Pastebin,
  Image,
  Health,
} from './entities'

// Import MikroORMConfig and DatabaseOptions from mikro-orm.config
import { MikroORMConfig } from './mikro-orm.config'
import type { DatabaseOptions } from './mikro-orm.config'

export { MikroORMConfig, DatabaseOptions }

/**
 * Interfaces
 *
 * @description Interface exports for each entity
 */
export type {
  MicroserviceInterface,
  NewsInterface,
  TechnologyInterface,
} from './entities'

/**
 * Enums
 */

export {
  Country,
  Gender,
  Pronoun,
  Role,
  Sex,
  Sexuality,
  TechCategory,
} from './enums'
