/**
 * @name StatusUrls
 *
 * @description This object contains the URLs for the status pages of Discord and Cloudflare.
 *
 * @property discord - The URLs for the Discord status pages.
 * @property discord.summary - The URL for the Discord status summary.
 * @property discord.status - The URL for the Discord status.
 * @property cloudflare - The URLs for the Cloudflare status pages.
 * @property cloudflare.summary - The URL for the Cloudflare status summary.
 * @property cloudflare.status - The URL for the Cloudflare status.
 */
export const StatusUrls = {
  discord: {
    summary: 'https://discordstatus.com/api/v2/summary.json',
    status: 'https://discordstatus.com/api/v2/status.json',
  },
  cloudflare: {
    summary: 'https://www.cloudflarestatus.com/api/v2/summary.json',
    status: 'https://www.cloudflarestatus.com/api/v2/status.json',
  },
}