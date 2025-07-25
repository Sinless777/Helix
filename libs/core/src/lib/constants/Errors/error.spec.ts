import { ErrorCodes } from './errors'

describe('ErrorCodes', () => {
  describe('System', () => {
    it('should have the correct api error codes', () => {
      expect(ErrorCodes.System.api.AUTH_SERVER_DOWN).toBe(100)
    })

    it('should have the correct database error codes', () => {
      expect(ErrorCodes.System.database).toBeNull()
    })

    it('should have the correct gateway error codes', () => {
      expect(ErrorCodes.System.gateway).toBeNull()
    })

    it('should have the correct dashboard error codes', () => {
      expect(ErrorCodes.System.dashboard).toBeNull()
    })

    it('should have the correct discord error codes', () => {
      expect(ErrorCodes.System.discord.API_DOWN).toBe(500)
      expect(ErrorCodes.System.discord.CLOUDFLARE_DOWN).toBe(501)
      expect(ErrorCodes.System.discord.BRAZIL_DOWN).toBe(502)
      expect(ErrorCodes.System.discord.ROTTERDAM_DOWN).toBe(503)
      expect(ErrorCodes.System.discord.MEDIA_PROXY_DOWN).toBe(504)
      expect(ErrorCodes.System.discord.TAX_CALCULATION_SERVICE_DOWN).toBe(505)
      expect(ErrorCodes.System.discord.HONG_KONG_DOWN).toBe(506)
      expect(ErrorCodes.System.discord.CREATOR_PAYOUTS_DOWN).toBe(507)
      expect(ErrorCodes.System.discord.GATEWAY_DOWN).toBe(508)
      expect(ErrorCodes.System.discord.PUSH_NOTIFICATIONS_DOWN).toBe(509)
      expect(ErrorCodes.System.discord.INDIA_DOWN).toBe(510)
      expect(ErrorCodes.System.discord.JAPAN_DOWN).toBe(511)
      expect(ErrorCodes.System.discord.SEARCH_DOWN).toBe(512)
      expect(ErrorCodes.System.discord.VOICE_DOWN).toBe(513)
      expect(ErrorCodes.System.discord.RUSSIA_DOWN).toBe(514)
      expect(ErrorCodes.System.discord.SINGAPORE_DOWN).toBe(515)
      expect(ErrorCodes.System.discord.THIRD_PARTY_DOWN).toBe(516)
      expect(ErrorCodes.System.discord.SOUTH_AFRICA_DOWN).toBe(517)
      expect(ErrorCodes.System.discord.SERVER_WEB_PAGES_DOWN).toBe(518)
      expect(ErrorCodes.System.discord.SOUTH_KOREA_DOWN).toBe(519)
      expect(ErrorCodes.System.discord.PAYMENTS_DOWN).toBe(520)
      expect(ErrorCodes.System.discord.SYDNEY_DOWN).toBe(521)
      expect(ErrorCodes.System.discord.US_CENTRAL_DOWN).toBe(522)
      expect(ErrorCodes.System.discord.US_EAST_DOWN).toBe(523)
      expect(ErrorCodes.System.discord.US_SOUTH_DOWN).toBe(524)
      expect(ErrorCodes.System.discord.US_WEST_DOWN).toBe(525)
    })

    it('should have the correct discordApi error codes', () => {
      expect(ErrorCodes.System.discordApi).toBeNull()
    })

    it('should have the correct discordBot error codes', () => {
      expect(ErrorCodes.System.discordBot).toBeNull()
    })

    it('should have the correct cloudflare error codes', () => {
      expect(ErrorCodes.System.cloudflare.SITES_AND_SERVICES_DOWN).toBe(800)
      expect(ErrorCodes.System.cloudflare.ACCESS_DOWN).toBe(801)
      expect(ErrorCodes.System.cloudflare.ALWAYS_ONLINE_DOWN).toBe(802)
      expect(ErrorCodes.System.cloudflare.ANALYTICS_DOWN).toBe(803)
      expect(ErrorCodes.System.cloudflare.API_DOWN).toBe(804)
      expect(ErrorCodes.System.cloudflare.API_SHIELD_DOWN).toBe(805)
      expect(ErrorCodes.System.cloudflare.DASHBOARD_DOWN).toBe(806)
      expect(ErrorCodes.System.cloudflare.DEVELOPERS_DOWN).toBe(807)
      expect(ErrorCodes.System.cloudflare.AUTHORITATIVE_DNS_DOWN).toBe(808)
      expect(ErrorCodes.System.cloudflare.DNS_ROOT_SERVERS_DOWN).toBe(809)
    })
  })

  describe('Bot', () => {
    it('should have the correct Bot error codes', () => {
      expect(ErrorCodes.Bot.AFK).toBeNull()
      expect(ErrorCodes.Bot.ActionLog).toBeNull()
      expect(ErrorCodes.Bot.Announcements).toBeNull()
      expect(ErrorCodes.Bot.AntiRaid).toBeNull()
      expect(ErrorCodes.Bot.AntiSpam).toBeNull()
      expect(ErrorCodes.Bot.AutoBan).toBeNull()
      expect(ErrorCodes.Bot.AutoMessage).toBeNull()
      expect(ErrorCodes.Bot.AutoMod).toBeNull()
      expect(ErrorCodes.Bot.AutoPurge).toBeNull()
      expect(ErrorCodes.Bot.AutoResponder).toBeNull()
      expect(ErrorCodes.Bot.AutoRoles).toBeNull()
      expect(ErrorCodes.Bot.Forms).toBeNull()
      expect(ErrorCodes.Bot.Giveaways).toBeNull()
      expect(ErrorCodes.Bot.Highlights).toBeNull()
      expect(ErrorCodes.Bot.Leveling).toBeNull()
      expect(ErrorCodes.Bot.Logging).toBeNull()
      expect(ErrorCodes.Bot.MessageEmbedder).toBeNull()
      expect(ErrorCodes.Bot.Moderation).toBeNull()
      expect(ErrorCodes.Bot.Music).toBeNull()
      expect(ErrorCodes.Bot.Polls).toBeNull()
      expect(ErrorCodes.Bot.Protection).toBeNull()
      expect(ErrorCodes.Bot.ReactionRoles).toBeNull()
      expect(ErrorCodes.Bot.Reddit).toBeNull()
      expect(ErrorCodes.Bot.SlowMode).toBeNull()
      expect(ErrorCodes.Bot.Starboard).toBeNull()
      expect(ErrorCodes.Bot.Suggestions).toBeNull()
      expect(ErrorCodes.Bot.Tags).toBeNull()
      expect(ErrorCodes.Bot.TemporaryChannels).toBeNull()
      expect(ErrorCodes.Bot.Tickets).toBeNull()
      expect(ErrorCodes.Bot.Tupper).toBeNull()
      expect(ErrorCodes.Bot.Twitch).toBeNull()
      expect(ErrorCodes.Bot.Utility).toBeNull()
      expect(ErrorCodes.Bot.Welcome).toBeNull()
      expect(ErrorCodes.Bot.Youtube).toBeNull()
    })
  })
})
