// libs/logger/src/types/RouteRule.spec.ts

describe('RouteRule shape', () => {
  it('must have required fields', () => {
    const rule = {
      id: 'uuid-1234',
      enabled: true,
      description: 'Test rule',
      drivers: ['console', 'file'],
    }

    expect(rule).toHaveProperty('id', 'uuid-1234')
    expect(typeof rule.id).toBe('string')

    expect(rule).toHaveProperty('enabled', true)
    expect(typeof rule.enabled).toBe('boolean')

    expect(rule).toHaveProperty('description', 'Test rule')
    expect(typeof rule.description).toBe('string')

    expect(rule).toHaveProperty('drivers')
    expect(Array.isArray(rule.drivers)).toBe(true)
    expect(rule.drivers).toContain('console')
  })

  it('allows optional pattern and levels', () => {
    const rule = {
      id: 'uuid-5678',
      enabled: false,
      description: 'Pattern rule',
      pattern: 'errors.*',
      levels: ['error', 'warn'],
      drivers: ['elasticsearch'],
    }

    expect(rule).toHaveProperty('pattern', 'errors.*')
    expect(typeof rule.pattern).toBe('string')

    expect(rule).toHaveProperty('levels')
    expect(Array.isArray(rule.levels)).toBe(true)
    expect(rule.levels).toEqual(expect.arrayContaining(['error', 'warn']))

    expect(rule.drivers).toEqual(['elasticsearch'])
  })
})
