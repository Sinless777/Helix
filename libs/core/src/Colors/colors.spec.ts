import { SystemColors, BotColors } from './colors'

describe('SystemColors', () => {
  it('should have reset color', () => {
    expect(SystemColors.reset).toBe('\x1b[0m')
  })

  it('should have bright color', () => {
    expect(SystemColors.bright).toBe('\x1b[1m')
  })
  describe('fg colors', () => {
    it('should have black foreground color', () => {
      expect(SystemColors.fg.black.ansi).toBe('\x1b[30m')
      expect(SystemColors.fg.black.hex).toBe('#000000')
      expect(SystemColors.fg.black.rgb).toBe('rgb(0, 0, 0)')
      expect(SystemColors.fg.black.rgba).toBe('rgba(0, 0, 0, 1)')
    })

    describe('bg colors', () => {
      it('should have black background color', () => {
        expect(SystemColors.bg.black.ansi).toBe('\x1b[40m')
        expect(SystemColors.bg.black.hex).toBe('#000000')
        expect(SystemColors.bg.black.rgb).toBe('rgb(0, 0, 0)')
        expect(SystemColors.bg.black.rgba).toBe('rgba(0, 0, 0, 1)')
      })
    })
  })
})

describe('BotColors', () => {
  describe('bot colors', () => {
    it('should have blue bot color', () => {
      expect(BotColors.bot.blue.hex).toBe('#022371')
      expect(BotColors.bot.blue.rgb).toBe('rgb(2, 35, 113)')
    })

    it('should have pink bot color', () => {
      expect(BotColors.bot.pink.hex).toBe('#f6066f')
      expect(BotColors.bot.pink.rgb).toBe('rgb(246, 6, 111)')
    })
  })

  describe('company colors', () => {
    it('should have gold company color', () => {
      expect(BotColors.company.gold.hex).toBe('#daa520')
      expect(BotColors.company.gold.rgb).toBe('rgb(218, 165, 32)')
    })

    it('should have silver company color', () => {
      expect(BotColors.company.silver.hex).toBe('#d1cfd0')
      expect(BotColors.company.silver.rgb).toBe('rgb(209, 207, 208)')
    })

    it('should have black company color', () => {
      expect(BotColors.company.black.hex).toBe('#000000')
      expect(BotColors.company.black.rgb).toBe('rgb(0, 0, 0)')
    })
  })

  describe('system colors', () => {
    it('should have critical system color', () => {
      expect(BotColors.system.critical.hex).toBe('#FF0000')
      expect(BotColors.system.critical.rgb).toBe('rgb(255, 0, 0)')
    })

    it('should have error system color', () => {
      expect(BotColors.system.error.hex).toBe('#EE4B2B')
      expect(BotColors.system.error.rgb).toBe('rgb(238, 75, 43)')
    })

    it('should have warning system color', () => {
      expect(BotColors.system.warning.hex).toBe('#FFEA00')
      expect(BotColors.system.warning.rgb).toBe('rgb(255, 234, 0)')
    })

    it('should have info system color', () => {
      expect(BotColors.system.info.hex).toBe('#0000FF')
      expect(BotColors.system.info.rgb).toBe('rgb(0, 0, 255)')
    })

    it('should have success system color', () => {
      expect(BotColors.system.success.hex).toBe('#00ff00')
      expect(BotColors.system.success.rgb).toBe('rgb(0, 255, 0)')
    })
  })
})
