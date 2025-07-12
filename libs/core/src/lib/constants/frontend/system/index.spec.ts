import { SystemColors } from './index';

describe('SystemColors constant', () => {
  it('should define basic ANSI style codes as strings', () => {
    const basicProps = ['reset','bright','dim','underscore','blink','reverse','hidden'] as const;
    basicProps.forEach((prop) => {
      const value = SystemColors[prop];
      expect(typeof value).toBe('string');
      expect(value).toMatch(/^\\x1b\[/);
    });
  });

  describe('foreground color definitions', () => {
    const fgKeys = ['black','red','green','yellow','blue','magenta','cyan','white','gray','crimson'] as const;
    fgKeys.forEach((color) => {
      it(`should define fg.${color} with ansi, hex, rgb, and rgba`, () => {
        const entry = SystemColors.fg[color];
        expect(entry).toHaveProperty('ansi');
        expect(typeof entry.ansi).toBe('string');
        expect(entry.ansi).toMatch(/^\\x1b\[/);

        expect(entry).toHaveProperty('hex');
        expect(typeof entry.hex).toBe('string');
        expect(entry.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);

        expect(entry).toHaveProperty('rgb');
        expect(typeof entry.rgb).toBe('string');
        expect(entry.rgb).toMatch(/^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/);

        expect(entry).toHaveProperty('rgba');
        expect(typeof entry.rgba).toBe('string');
        expect(entry.rgba).toMatch(/^rgba\(\d{1,3}, \d{1,3}, \d{1,3}, 1\)$/);
      });
    });
  });

  describe('background color definitions', () => {
    const bgKeys = ['black','red','green','yellow','blue','magenta','cyan','white','gray','crimson'] as const;
    bgKeys.forEach((color) => {
      it(`should define bg.${color} with ansi, hex, rgb, and rgba`, () => {
        const entry = SystemColors.bg[color];
        expect(entry).toHaveProperty('ansi');
        expect(typeof entry.ansi).toBe('string');
        expect(entry.ansi).toMatch(/^\\x1b\[/);

        expect(entry).toHaveProperty('hex');
        expect(typeof entry.hex).toBe('string');
        expect(entry.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);

        expect(entry).toHaveProperty('rgb');
        expect(typeof entry.rgb).toBe('string');
        expect(entry.rgb).toMatch(/^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/);

        expect(entry).toHaveProperty('rgba');
        expect(typeof entry.rgba).toBe('string');
        expect(entry.rgba).toMatch(/^rgba\(\d{1,3}, \d{1,3}, \d{1,3}, 1\)$/);
      });
    });
  });

  it('matches the snapshot of SystemColors', () => {
    expect(SystemColors).toMatchSnapshot();
  });
});
