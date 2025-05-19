export * from './discord'
export * from './user'
export * from './site'
export * from './system'

import * as discord from './discord'
import * as user from './user'
import * as site from './site'
import * as system from './system'

export const entities = [
  /**
   * User
   */
  user.User,
  user.Account,
  user.Session,
  user.UserProfile,
  user.UserSetting,

  /**
   * Helix System
   */
  system.Health,
  site.Microservice,
  site.News,
  site.Technology,

  /**
   * Discord
   */
  discord.DiscordUser,
  discord.DiscordGuild,
  discord.DiscordDailyStatistics,
  discord.Pastebin,
  discord.Image,
  discord.DiscordDailyStatistics,
  discord.DiscordWeeklyStatistics,
  discord.DiscordMonthlyStatistics,
  discord.DiscordYearlyStatistics,
]
