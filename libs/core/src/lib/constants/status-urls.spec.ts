import { StatusUrls } from './status-urls'

describe('StatusUrls constant', () => {
  it('should have discord and cloudflare properties', () => {
    expect(StatusUrls).toHaveProperty('discord')
    expect(StatusUrls).toHaveProperty('cloudflare')
  })

  describe('Discord URLs', () => {
    it('should have summary and status URLs as non-empty strings', () => {
      const discord = StatusUrls.discord
      expect(typeof discord.summary).toBe('string')
      expect(discord.summary).toMatch(/^https?:\/\//)
      expect(discord.summary.length).toBeGreaterThan(0)
      expect(typeof discord.status).toBe('string')
      expect(discord.status).toMatch(/^https?:\/\//)
      expect(discord.status.length).toBeGreaterThan(0)
    })
  })

  describe('Cloudflare URLs', () => {
    it('should have summary and status URLs as non-empty strings', () => {
      const cf = StatusUrls.cloudflare
      expect(typeof cf.summary).toBe('string')
      expect(cf.summary).toMatch(/^https?:\/\//)
      expect(cf.summary.length).toBeGreaterThan(0)
      expect(typeof cf.status).toBe('string')
      expect(cf.status).toMatch(/^https?:\/\//)
      expect(cf.status.length).toBeGreaterThan(0)
    })
  })

  it('matches the snapshot of StatusUrls', () => {
    expect(StatusUrls).toMatchSnapshot()
  })
})
