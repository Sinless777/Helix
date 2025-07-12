import { Pillars, KeyValuePillars } from './key_value_pillars';

describe('KeyValuePillars array', () => {
  it('should be an array of Pillars objects', () => {
    expect(Array.isArray(KeyValuePillars)).toBe(true);
    KeyValuePillars.forEach((pillar: Pillars) => {
      expect(pillar).toHaveProperty('title');
      expect(typeof pillar.title).toBe('string');
      expect(pillar.title.length).toBeGreaterThan(0);
      expect(pillar).toHaveProperty('description');
      expect(typeof pillar.description).toBe('string');
      expect(pillar.description.length).toBeGreaterThan(0);
    });
  });

  it('should contain the expected number of pillars', () => {
    // There are 5 pillars defined
    expect(KeyValuePillars).toHaveLength(5);
  });

  it('matches the snapshot of KeyValuePillars', () => {
    expect(KeyValuePillars).toMatchSnapshot();
  });
});
