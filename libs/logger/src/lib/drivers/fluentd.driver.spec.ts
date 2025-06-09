import { support as fluentSupport } from "fluent-logger";
import { FluentdDriver, FluentdDriverOptions } from "./fluentd.driver";
import type { LogRecord, LogLevel } from "../logger";

// Mock the fluent-logger transport factory
jest.mock("fluent-logger", () => {
  const DummyTransport = jest.fn().mockImplementation(() => ({
    log: jest.fn(
      (level: LogLevel, record: LogRecord, callback: (err?: Error) => void) =>
        callback(),
    ),
  }));
  return { support: { winstonTransport: () => DummyTransport } };
});

describe("FluentdDriver", () => {
  const options: FluentdDriverOptions = {
    host: "localhost",
    port: 24224,
    tag: "helix",
    timeout: 2.0,
    requireAckResponse: true,
    level: "info",
  };
  let driver: FluentdDriver;
  let DummyTransportCtor: jest.Mock;

  beforeEach(() => {
    const transportFactory = fluentSupport.winstonTransport as jest.Mock;
    DummyTransportCtor = transportFactory();
    DummyTransportCtor.mockClear();
    driver = new FluentdDriver(options);
  });

  it("initializes and starts the driver", async () => {
    expect(driver.isRunning()).toBe(false);
    await driver.initialize();
    expect(driver.isRunning()).toBe(true);
    expect(DummyTransportCtor).toHaveBeenCalledWith("helix", options);
  });

  it("logs a record when running and enabled", async () => {
    await driver.initialize();
    const record: LogRecord = {
      timestamp: new Date().toISOString(),
      level: "info",
      message: "hello",
      service: "svc",
      host: "h",
      pid: 1,
      environment: "test",
      uptime: 0,
    };
    const instance = DummyTransportCtor.mock.results[0].value;
    await driver.log(record);
    expect(instance.log).toHaveBeenCalledWith(
      "info",
      record,
      expect.any(Function),
    );
  });

  it("does not log when disabled", async () => {
    await driver.initialize();
    driver.disable();
    const record: LogRecord = {
      timestamp: "",
      level: "info",
      message: "",
      service: "svc",
      host: "h",
      pid: 1,
      environment: "test",
      uptime: 0,
    };
    const instance = DummyTransportCtor.mock.results[0].value;
    await driver.log(record);
    expect(instance.log).not.toHaveBeenCalled();
  });

  it("stops the driver correctly", async () => {
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
