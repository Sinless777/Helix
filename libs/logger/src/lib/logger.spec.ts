import TransportStream from 'winston-transport'
import type { DynamicModule } from '@nestjs/common'
import { HelixLogger, ILoggerConfig } from './logger'

describe('HelixLogger', () => {
  /**
   * A typed shape for captured log entries in tests
   */
  interface TestLog {
    level?: string
    message: string
    fatal?: boolean
    namespace?: string
    [key: string]: unknown
  }

  let testTransport: TestTransport
  let logger: HelixLogger

  class TestTransport extends TransportStream {
    public logs: TestLog[] = []

    override log(info: unknown, next: () => void): void {
      // Cast the generic info to our TestLog shape
      const record = info as TestLog
      this.logs.push(record)
      next()
    }
  }

  beforeEach(() => {
    testTransport = new TestTransport()
    // default level info, but override to debug to capture all
    logger = new HelixLogger('test-service', {
      level: 'debug',
      transports: [testTransport],
    } as ILoggerConfig)
  })

  it('should log messages at or above the configured level', () => {
    logger.log('test-service', 'debug', 'debug message')
    logger.log('test-service', 'info', 'info message')
    expect(testTransport.logs.map((l) => l.message)).toEqual([
      'debug message',
      'info message',
    ])
  })

  it('should not log messages below the configured level', () => {
    // set level to warn
    logger = new HelixLogger('warn-service', {
      level: 'warn',
      transports: [testTransport],
    } as ILoggerConfig)
    logger.log('warn-service', 'info', 'info drop')
    expect(testTransport.logs).toHaveLength(0)
  })

  it('should tag fatal messages with fatal metadata', () => {
    logger.log('test-service', 'fatal', 'fatal encountered')
    expect(testTransport.logs).toHaveLength(1)
    expect(testTransport.logs[0].fatal).toBe(true)
  })

  it('should provide convenience methods for each level', () => {
    logger.info('test-service', 'info msg', { foo: 'bar' })
    logger.warn('test-service', 'warn msg')
    logger.error('test-service', 'error msg')
    expect(testTransport.logs.map((l) => l.message)).toEqual([
      'info msg',
      'warn msg',
      'error msg',
    ])
  })

  it('getLogger returns the underlying Winston logger', () => {
    const raw = logger.getLogger()
    expect(typeof raw.info).toBe('function')
    raw.info('raw log')
    expect(testTransport.logs.some((l) => l.message === 'raw log')).toBe(true)
  })

  it('static getModule returns a NestJS module definition', () => {
    const mod: DynamicModule = HelixLogger.getModule({
      level: 'error',
    } as ILoggerConfig)
    expect(mod).toBeDefined()
    expect(mod.module).toBeDefined()
  })

  it('static expressLogger returns a request middleware function', () => {
    const mw = HelixLogger.expressLogger()
    expect(typeof mw).toBe('function')
  })

  it('static expressErrorLogger returns an error middleware function', () => {
    const errMw = HelixLogger.expressErrorLogger()
    expect(typeof errMw).toBe('function')
  })
})
