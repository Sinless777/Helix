import { OpenTelemetryDriver } from './opentelemetry.driver'
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston'

describe('OpenTelemetryDriver', () => {
  let driver: OpenTelemetryDriver
  let enableSpy: jest.SpyInstance
  let disableSpy: jest.SpyInstance

  beforeEach(() => {
    enableSpy = jest
      .spyOn(WinstonInstrumentation.prototype, 'enable')
      .mockImplementation()
    disableSpy = jest
      .spyOn(WinstonInstrumentation.prototype, 'disable')
      .mockImplementation()
    driver = new OpenTelemetryDriver({ disableLogSending: true })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should be disabled and not running initially', () => {
    expect(driver.isEnabled()).toBe(false)
    expect(driver.isRunning()).toBe(false)
  })

  it('initialize() should enable instrumentation and set running', async () => {
    await driver.initialize()
    expect(enableSpy).toHaveBeenCalledTimes(1)
    expect(driver.isEnabled()).toBe(true)
    expect(driver.isRunning()).toBe(true)
  })

  it('start() should init if not initialized and then set running', async () => {
    await driver.start()
    // initialization path should call enable once
    expect(enableSpy).toHaveBeenCalledTimes(1)
    expect(driver.isRunning()).toBe(true)

    // calling start again should not re-enable
    await driver.start()
    expect(enableSpy).toHaveBeenCalledTimes(1)
    expect(driver.isRunning()).toBe(true)
  })

  it('stop() should disable instrumentation and set not running', async () => {
    // first init to have instrumentation
    await driver.initialize()
    expect(driver.isRunning()).toBe(true)

    await driver.stop()
    expect(disableSpy).toHaveBeenCalledTimes(1)
    expect(driver.isRunning()).toBe(false)
  })

  it('shutdown() should call stop()', async () => {
    const stopSpy = jest.spyOn(driver, 'stop')
    await driver.shutdown()
    expect(stopSpy).toHaveBeenCalledTimes(1)
  })

  it('log() should be a no-op and not throw', async () => {
    await expect(driver.log()).resolves.toBeUndefined()
  })
})
