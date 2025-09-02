// libs/core/src/lib/constants/Errors/error.type.ts

/** Base alias for readability */
export type Code = number

/** Your original structural typing (kept for compatibility) */
export type errCodes = {
  System: {
    api: {
      AUTH_SERVER_DOWN: Code
      INVALID_REQUEST: Code
      UNAUTHORIZED: Code
      FORBIDDEN: Code
      NOT_FOUND: Code
      TIMEOUT: Code
      RATE_LIMITED: Code
      INTERNAL_ERROR: Code
      BAD_GATEWAY: Code
      SERVICE_UNAVAILABLE: Code
    }
    database: null
    gateway: null
    dashboard: null
    discord: {
      API_DOWN: Code
      CLOUDFLARE_DOWN: Code
      BRAZIL_DOWN: Code
      ROTTERDAM_DOWN: Code
      MEDIA_PROXY_DOWN: Code
      TAX_CALCULATION_SERVICE_DOWN: Code
      HONG_KONG_DOWN: Code
      CREATOR_PAYOUTS_DOWN: Code
      GATEWAY_DOWN: Code
      PUSH_NOTIFICATIONS_DOWN: Code
      INDIA_DOWN: Code
      JAPAN_DOWN: Code
      SEARCH_DOWN: Code
      VOICE_DOWN: Code
      RUSSIA_DOWN: Code
      SINGAPORE_DOWN: Code
      THIRD_PARTY_DOWN: Code
      SOUTH_AFRICA_DOWN: Code
      SERVER_WEB_PAGES_DOWN: Code
      SOUTH_KOREA_DOWN: Code
      PAYMENTS_DOWN: Code
      SYDNEY_DOWN: Code
      US_CENTRAL_DOWN: Code
      US_EAST_DOWN: Code
      US_SOUTH_DOWN: Code
      US_WEST_DOWN: Code
    }
    discordApi: null
    discordBot: null
    cloudflare: {
      SITES_AND_SERVICES_DOWN: Code
      ACCESS_DOWN: Code
      ALWAYS_ONLINE_DOWN: Code
      ANALYTICS_DOWN: Code
      API_DOWN: Code
      API_SHIELD_DOWN: Code
      DASHBOARD_DOWN: Code
      DEVELOPERS_DOWN: Code
      AUTHORITATIVE_DNS_DOWN: Code
      DNS_ROOT_SERVERS_DOWN: Code
      DNS_UPDATES_DOWN: Code
      RECURSIVE_DNS_DOWN: Code
    }
  }
  Bot: {
    AFK: null
    ActionLog: null
    Announcements: null
    AntiRaid: null
    AntiSpam: null
    AutoBan: null
    AutoMessage: null
    AutoMod: null
    AutoPurge: null
    AutoResponder: null
    AutoRoles: null
    Forms: null
    Giveaways: null
    Highlights: null
    Leveling: null
    Logging: null
    MessageEmbedder: null
    Moderation: null
    Music: null
    Polls: null
    Protection: null
    ReactionRoles: null
    Reddit: null
    SlowMode: null
    Starboard: null
    Suggestions: null
    Tags: null
    TemporaryChannels: null
    Tickets: null
    Tupper: null
    Twitch: null
    Utility: null
    Welcome: null
    Youtube: null
  }
}

/** ---------- Derived helper types (for free) ---------- */

/** Recursively collect all numeric codes as a union type */
export type CollectCodes<T> = T extends number
  ? T
  : T extends Record<string, unknown>
    ? CollectCodes<T[keyof T]>
    : never

/** Flatten path keys like "System.discord.API_DOWN" for lookups */
export type CollectPaths<T, P extends string = ''> = T extends number
  ? P
  : T extends null
    ? never
    : T extends Record<string, unknown>
      ? {
          [K in Extract<keyof T, string>]: CollectPaths<
            T[K],
            P extends '' ? K : `${P}.${K}`
          >
        }[Extract<keyof T, string>]
      : never

/** Builder function (gives better inference when defining the table) */
export const defineErrors = <T extends errCodes>(t: T) => t
