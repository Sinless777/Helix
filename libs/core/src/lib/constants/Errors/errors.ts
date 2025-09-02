// libs/core/src/lib/constants/Errors/errors.ts
import {
  defineErrors,
  type errCodes,
  type CollectCodes,
  type CollectPaths
} from './error.type.js'

/** The canonical error registry */
export const ErrorCodes = defineErrors({
  // S-xxx
  System: {
    // S-1xx
    api: {
      AUTH_SERVER_DOWN: 100,
      INVALID_REQUEST: 101,
      UNAUTHORIZED: 102,
      FORBIDDEN: 103,
      NOT_FOUND: 104,
      TIMEOUT: 105,
      RATE_LIMITED: 106,
      INTERNAL_ERROR: 107,
      BAD_GATEWAY: 108,
      SERVICE_UNAVAILABLE: 109
    },
    // S-2xx
    database: null,
    // S-3xx
    gateway: null,
    // S-4xx
    dashboard: null,
    // S-5xx
    discord: {
      API_DOWN: 500,
      CLOUDFLARE_DOWN: 501,
      BRAZIL_DOWN: 502,
      ROTTERDAM_DOWN: 503,
      MEDIA_PROXY_DOWN: 504,
      TAX_CALCULATION_SERVICE_DOWN: 505,
      HONG_KONG_DOWN: 506,
      CREATOR_PAYOUTS_DOWN: 507,
      GATEWAY_DOWN: 508,
      PUSH_NOTIFICATIONS_DOWN: 509,
      INDIA_DOWN: 510,
      JAPAN_DOWN: 511,
      SEARCH_DOWN: 512,
      VOICE_DOWN: 513,
      RUSSIA_DOWN: 514,
      SINGAPORE_DOWN: 515,
      THIRD_PARTY_DOWN: 516,
      SOUTH_AFRICA_DOWN: 517,
      SERVER_WEB_PAGES_DOWN: 518,
      SOUTH_KOREA_DOWN: 519,
      PAYMENTS_DOWN: 520,
      SYDNEY_DOWN: 521,
      US_CENTRAL_DOWN: 522,
      US_EAST_DOWN: 523,
      US_SOUTH_DOWN: 524,
      US_WEST_DOWN: 525
    },
    // S-6xx
    discordApi: null,
    // S-7xx
    discordBot: null,
    // S-8xx
    cloudflare: {
      SITES_AND_SERVICES_DOWN: 800,
      ACCESS_DOWN: 801,
      ALWAYS_ONLINE_DOWN: 802,
      ANALYTICS_DOWN: 803,
      API_DOWN: 804,
      API_SHIELD_DOWN: 805,
      DASHBOARD_DOWN: 806,
      DEVELOPERS_DOWN: 807,
      AUTHORITATIVE_DNS_DOWN: 808,
      DNS_ROOT_SERVERS_DOWN: 809,
      DNS_UPDATES_DOWN: 810,
      RECURSIVE_DNS_DOWN: 811
    }
  },
  // B-xxx
  Bot: {
    // Keep your placeholders as null for now (tests expect null)
    AFK: null,
    ActionLog: null,
    Announcements: null,
    AntiRaid: null,
    AntiSpam: null,
    AutoBan: null,
    AutoMessage: null,
    AutoMod: null,
    AutoPurge: null,
    AutoResponder: null,
    AutoRoles: null,
    Forms: null,
    Giveaways: null,
    Highlights: null,
    Leveling: null,
    Logging: null,
    MessageEmbedder: null,
    Moderation: null,
    Music: null,
    Polls: null,
    Protection: null,
    ReactionRoles: null,
    Reddit: null,
    SlowMode: null,
    Starboard: null,
    Suggestions: null,
    Tags: null,
    TemporaryChannels: null,
    Tickets: null,
    Tupper: null,
    Twitch: null,
    Utility: null,
    Welcome: null,
    Youtube: null
  }
} as const satisfies errCodes)

/** --------- Strongly-typed helpers (auto-derived) --------- */

/** Union of all known numeric codes (e.g., 100 | 500 | 501 | ...) */
export type KnownErrorCode = CollectCodes<typeof ErrorCodes>

/** Union of all valid path strings (e.g., "System.discord.API_DOWN") */
export type KnownErrorPath = CollectPaths<typeof ErrorCodes>

/** Build a flat map { "System.discord.API_DOWN": 500, ... } for lookups */
function buildFlatMap(
  node: unknown,
  prefix = '',
  out: Record<string, number> = {}
): Record<string, number> {
  if (typeof node === 'number') {
    out[prefix] = node
    return out
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (v === null) continue // skip placeholders
      const next = prefix ? `${prefix}.${k}` : k
      buildFlatMap(v, next, out)
    }
  }
  return out
}

const __FLAT = buildFlatMap(ErrorCodes)

/** Get code by its dotted path (fully typed if you use KnownErrorPath) */
export function getErrorCode(
  path: KnownErrorPath | string
): number | undefined {
  return __FLAT[path]
}

/** Reverse lookup: find the path name for a numeric code */
export function getErrorPathByCode(code: number): KnownErrorPath | undefined {
  // O(n) over map size; tiny map so fine. Could cache a reverse map if desired.
  for (const [k, v] of Object.entries(__FLAT)) {
    if (v === code) return k as KnownErrorPath
  }
  return undefined
}

/** Type guard: is this number one of our known codes? */
export function isKnownErrorCode(code: number): code is KnownErrorCode {
  return getErrorPathByCode(code) !== undefined
}
