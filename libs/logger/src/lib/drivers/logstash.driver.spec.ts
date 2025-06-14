import LogstashTransport from "winston3-logstash-transport";
import { LogstashDriver, LogstashDriverOptions } from "./logstash.driver";
import type { LogRecord } from "../logger";

// Mock the Logstash transport
jest.mock("winston3-logstash-transport", () => {
  const log = jest.fn((payload: object, callback: (err?: Error) => void) =>
    callback(),
  );
  const close = jest.fn(() => Promise.resolve());
  return jest.fn().mockImplementation(() => ({ log, close }));
});
const DummyTransport = LogstashTransport as jest.MockedClass<
  typeof LogstashTransport
>;

describe("LogstashDriver", () => {
  let driver: LogstashDriver;
  const options: LogstashDriverOptions = {
    host: "localhost",
    port: 5000,
    mode: "tcp",
    level: "warn",
    formatter: (record) => ({ custom: record.message }),
  };
  const record: LogRecord = {
    timestamp: new Date().toISOString(),
    level: "warn",
    message: "test-logstash",
    service: "svc",
    host: "host",
    pid: 123,
    environment: "test",
    uptime: 0,
  };

  beforeEach(() => {
    DummyTransport.mockClear();
    driver = new LogstashDriver(options);
  });

  it("initializes transport with correct options and starts running", async () => {
    expect(driver.isRunning()).toBe(false);
    await driver.initialize();
    expect(DummyTransport).toHaveBeenCalledWith({
      host: options.host,
      port: options.port,
      mode: options.mode,
      level: options.level,
    });
    expect(driver.isRunning()).toBe(true);
  });

  it("logs formatted payload when running and enabled", async () => {
    await driver.initialize();
    const instance = DummyTransport.mock.instances[0];
    await driver.log(record);
    expect(instance.log).toHaveBeenCalledWith(
      { custom: record.message },
      expect.any(Function),
    );
  });

  it("logs default payload when no formatter provided", async () => {
    // Remove formatter option
    const optsNoFmt: LogstashDriverOptions = { host: "h", port: 1234 };
    driver = new LogstashDriver(optsNoFmt);
    await driver.initialize();
    const rec: LogRecord = { ...record, level: "info" };
    await driver.log(rec);
    const instance = DummyTransport.mock.instances[0];
    expect(instance.log).toHaveBeenCalledWith(
      { ...rec, level: rec.level, message: rec.message },
      expect.any(Function),
    );
  });

  it("does not log when disabled", async () => {
    await driver.initialize();
    const instance = DummyTransport.mock.instances[0];
    driver.disable();
    await driver.log(record);
    expect(instance.log).not.toHaveBeenCalled();
  });

  it("stop disables running state", async () => {
    await driver.initialize();
    expect(driver.isRunning()).toBe(true);
    await driver.stop();
    expect(driver.isRunning()).toBe(false);
  });

  it("shutdown closes transport and stops driver", async () => {
    await driver.initialize();
    const instance = DummyTransport.mock.instances[0];
    await driver.shutdown();
    expect(instance.close).toHaveBeenCalled();
    expect(driver.isRunning()).toBe(false);
  });
});
