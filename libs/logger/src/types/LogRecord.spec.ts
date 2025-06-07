// libs/logger/src/types/LogRecord.spec.ts

describe('LogRecord shape', () => {
  it('must have the required fields', () => {
    const sample = {
      timestamp: '2025-01-01T00:00:00.000Z',
      level: 'info',
      service: 'my-service',
      message: 'Hello world',
    }

    // Required props
    expect(sample).toHaveProperty('timestamp')
    expect(typeof sample.timestamp).toBe('string')

    expect(sample).toHaveProperty('level')
    expect(typeof sample.level).toBe('string')

    expect(sample).toHaveProperty('service')
    expect(typeof sample.service).toBe('string')

    expect(sample).toHaveProperty('message')
    expect(typeof sample.message).toBe('string')
  })

  it('allows optional context and metadata', () => {
    const sample = {
      timestamp: '2025-01-01T00:00:00.000Z',
      level: 'error',
      service: 'svc',
      message: 'Oops',
      context: 'SomeContext',
      metadata: { userId: 'u1', foo: 'bar' },
    }

    expect(sample).toHaveProperty('context', 'SomeContext')
    expect(sample).toHaveProperty('metadata')
    expect(sample.metadata).toMatchObject({ userId: 'u1', foo: 'bar' })
  })
})
