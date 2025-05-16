import { DriverBase } from './driver.base'

describe('DriverBase', () => {
  // Concrete subclass for testing
  class TestDriver extends DriverBase {
    public initialized = false
    public started = false
    public logged: unknown[] = []
    public stopped = false
    public shutDown = false

    async initialize(): Promise<void> {
      this.initialized = true
    }

    async start(): Promise<void> {
      // simulate starting logic
      this.setRunning(true)
      this.started = true
    }

    async log(record: unknown): Promise<void> {
      this.logged.push(record)
    }

    async stop(): Promise<void> {
      this.setRunning(false)
      this.stopped = true
    }

    async shutdown(): Promise<void> {
      this.shutDown = true
    }
  }

  let driver: TestDriver
  beforeEach(() => {
    driver = new TestDriver()
  })

  it('should be not enabled by default', () => {
    expect(driver.isEnabled()).toBe(false)
  })

  it('should disable and enable correctly', () => {
    driver.disable()
    expect(driver.isEnabled()).toBe(false)
    driver.enable()
    expect(driver.isEnabled()).toBe(true)
  })

  it('should not be running before start', () => {
    expect(driver.isRunning()).toBe(false)
  })

  it('should start and set running state', async () => {
    await driver.start()
    expect(driver.started).toBe(true)
    expect(driver.isRunning()).toBe(true)
  })

  it('should stop and clear running state', async () => {
    await driver.start()
    expect(driver.isRunning()).toBe(true)
    await driver.stop()
    expect(driver.stopped).toBe(true)
    expect(driver.isRunning()).toBe(false)
  })

  it('should initialize without affecting running state', async () => {
    expect(driver.initialized).toBe(false)
    await driver.initialize()
    expect(driver.initialized).toBe(true)
    expect(driver.isRunning()).toBe(false)
  })

  it('should log records when called', async () => {
    const record = { foo: 'bar' }
    expect(driver.logged).toHaveLength(0)
    await driver.log(record)
    expect(driver.logged).toContain(record)
  })

  it('should shutdown properly', async () => {
    expect(driver.shutDown).toBe(false)
    await driver.shutdown()
    expect(driver.shutDown).toBe(true)
  })
})
