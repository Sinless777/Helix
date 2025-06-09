import LokiTransport from "winston-loki";
import { LokiDriver, LokiDriverOptions } from "./loki.driver";
import type { LogRecord } from "../logger";

// Mock winston-loki transport
jest.mock("winston-loki", () => {
  const log = jest.fn((payload: unknown, callback: (err?: Error) => void) =>
    callback(),
  );
  return jest.fn().mockImplementation(() => ({ log }));
});
const MockTransport = LokiTransport as jest.MockedClass<typeof LokiTransport>;

describe("LokiDriver", () => {
  let driver: LokiDriver;
  const options: LokiDriverOptions = {
    host: "http://localhost:3100",
    labels: { app: "test" },
    basicAuth: "user:pass",
    level: "info",
    json: false,
  };
  const record: LogRecord = {
    timestamp: new Date().toISOString(),
    level: "info",
    message: "hello loki",
    service: "svc",
    host: "host",
    pid: 123,
    environment: "test",
    uptime: 0,
  };

  beforeEach(() => {
    MockTransport.mockClear();
    driver = new LokiDriver(options);
  });

  it("initializes transport and starts running", async () => {
    expect(driver.isRunning()).toBe(false);
    await driver.initialize();
    expect(MockTransport).toHaveBeenCalledWith(options);
    expect(driver.isRunning()).toBe(true);
  });

  it("logs a record when running and enabled", async () => {
    await driver.initialize();
    const instance = MockTransport.mock.instances[0];
    await driver.log(record);
    expect(instance.log).toHaveBeenCalledWith(
      { ...record, level: record.level, message: record.message },
      expect.any(Function),
    );
  });

  it("does not log when disabled", async () => {
    await driver.initialize();
    driver.disable();
    const instance = MockTransport.mock.instances[0];
    await driver.log(record);
    expect(instance.log).not.toHaveBeenCalled();
  });

  it("stop sets running false", async () => {
    await driver.initialize();
    expect(driver.isRunning()).toBe(true);
    await driver.stop();
    expect(driver.isRunning()).toBe(false);
  });

  it("shutdown stops the driver", async () => {
    await driver.initialize();
    await driver.shutdown();
    expect(driver.isRunning()).toBe(false);
  });
});
