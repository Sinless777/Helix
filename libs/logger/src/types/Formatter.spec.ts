// libs/logger/src/types/Formatter.spec.ts

describe('Formatter interface', () => {
  it('allows a custom formatter to format a record', () => {
    const mockRecord = {
      level: 'info',
      message: 'Test message',
      context: '',
      timestamp: new Date().toISOString(),
      service: 'test_service',
    }

    // minimal formatter implementation
    const testFormatter = {
      format(record) {
        return `[${record.level}] ${record.message}`
      },
    }

    const result = testFormatter.format(mockRecord)
    expect(result).toBe('[info] Test message')
  })
})
