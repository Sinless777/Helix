import fs from 'fs'
import os from 'os'
import path from 'path'
import { FileDriver, FileDriverOptions } from './file.driver'
import type { LogRecord } from '../logger'

describe('FileDriver', () => {
  let tmpFile: string
  let driver: FileDriver
  const record: LogRecord = {
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'test-file-driver',
    service: 'svc',
    host: os.hostname(),
    pid: process.pid,
    environment: 'test',
    uptime: 0,
  }

  beforeEach(() => {
    // Unique temp file per test
    tmpFile = path.join(os.tmpdir(), `helix-file-driver-${Date.now()}.log`)
    const opts: FileDriverOptions = { filename: tmpFile, level: 'info' }
    driver = new FileDriver(opts)
  })

  afterEach(() => {
    // Clean up temp file
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile)
  })

  it('should initialize and start the driver', async () => {
    expect(driver.isRunning()).toBe(false)
    await driver.initialize()
    expect(driver.isRunning()).toBe(true)
  })

  it('should log record to file', async () => {
    await driver.initialize()
    await driver.log(record)
    // Wait for file write
    const content = fs.readFileSync(tmpFile, 'utf8')
    expect(content).toContain(record.message)
    expect(content).toContain(record.level)
  })

  it('should not log when disabled', async () => {
    driver.disable()
    await driver.initialize()
    await driver.log(record)
    expect(fs.existsSync(tmpFile)).toBe(false)
  })

  it('should stop and clear running state', async () => {
    await driver.initialize()
    expect(driver.isRunning()).toBe(true)
    await driver.stop()
    expect(driver.isRunning()).toBe(false)
  })

  it('should shutdown the driver', async () => {
    await driver.initialize()
    await driver.shutdown()
    expect(driver.isRunning()).toBe(false)
  })
})
