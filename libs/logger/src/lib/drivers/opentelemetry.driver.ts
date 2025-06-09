import { DriverBase } from "./driver.base";
import {
  WinstonInstrumentation,
  WinstonInstrumentationConfig,
} from "@opentelemetry/instrumentation-winston";

/**
 * OpenTelemetryDriver sets up automatic log correlation and (optionally) log sending
 * by instrumenting Winston with OpenTelemetry.
 */
export class OpenTelemetryDriver extends DriverBase {
  private instrumentation?: WinstonInstrumentation;

  constructor(private options: WinstonInstrumentationConfig = {}) {
    super();
  }

  /**
   * Initialize the instrumentation and start the driver.
   */
  public async initialize(): Promise<void> {
    this.instrumentation = new WinstonInstrumentation(this.options);
    this.instrumentation.enable();
    this.setRunning(true);
  }

  /**
   * No-op: instrumentation automatically patches Winston transports.
   * @param record Unused by this driver.
   */
  public async log(): Promise<void> {
    // Instrumentation handles log correlation and sending; no explicit log call needed.
  }

  /**
   * Start is idempotent once initialized.
   */
  public async start(): Promise<void> {
    if (!this.instrumentation) {
      await this.initialize();
    }
    this.setRunning(true);
  }

  /**
   * Stop instrumentation and mark as not running.
   */
  public async stop(): Promise<void> {
    if (this.instrumentation) {
      this.instrumentation.disable();
    }
    this.setRunning(false);
  }

  /**
   * Shutdown the driver, disabling instrumentation.
   */
  public async shutdown(): Promise<void> {
    await this.stop();
  }
}
