// libs/shared/logger/src/transports/loki.transport.ts

import fetch from 'node-fetch'; // or global fetch if supported
import { LoggerConfig } from '../config';
import { LogRecord } from '../logger.interface';
import { LogLevel } from '../level';

interface LokiStream {
  stream: Record<string,string>;
  values: [string, string, Record<string, unknown>?][];
}

interface LokiPushPayload {
  streams: LokiStream[];
}

/**
 * LokiTransport: handles sending log records to Grafana Loki endpoint.
 */
export class LokiTransport {
  private endpoint: string;
  private defaultLabels: Record<string,string>;

  constructor(private readonly config: LoggerConfig) {
    if (!config.lokiEndpoint) {
      throw new Error('Loki endpoint must be defined in LoggerConfig for LokiTransport');
    }
    this.endpoint = config.lokiEndpoint;
    this.defaultLabels = config.defaultLabels ?? {};
  }

  /**
   * Builds a single Loki stream entry from a log record.
   */
  private buildStream(record: LogRecord): LokiStream {
    const { timestamp, level, serviceName, environment, labels: recordLabels, message, meta } = record;

    // Build combined labels for Loki stream
    const streamLabels: Record<string,string> = {
      service: serviceName,
      env: environment,
      level: level,
      ...this.defaultLabels,
      ...recordLabels,
    };

    // Value: timestamp in nanoseconds, message + optional meta object
    const line = meta ? `${message} ${JSON.stringify(meta)}` : message;
    const tsNano = (BigInt(new Date(timestamp).getTime()) * BigInt(1_000_000)).toString();

    return {
      stream: streamLabels,
      values: [[ tsNano, line ]]
    };
  }

  /**
   * Sends one or more records to Loki. Can be called for batching.
   */
  public async log(record: LogRecord): Promise<void> {
    const lvl: LogLevel = record.level;
    // Optionally filter by min level (you might do this earlier)
    if (this.config.minLevel) {
      const allLevels: LogLevel[] = ['trace','debug','info','warn','error','fatal','audit'];
      if (allLevels.indexOf(lvl) < allLevels.indexOf(this.config.minLevel)) {
        return;
      }
    }

    const payload: LokiPushPayload = {
      streams: [ this.buildStream(record) ]
    };

    const headers: Record<string,string> = {
      'Content-Type': 'application/json',
    };
    if (this.config.lokiApiKey) {
      headers['Authorization'] = `Bearer ${this.config.lokiApiKey}`;
    }

    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`LokiTransport failed: HTTP ${res.status} — ${body}`);
      }
    } catch (err) {
      console.error('LokiTransport error:', err);
    }
  }

  /**
   * Optional flush if batching is implemented later.
   */
  public async flush(): Promise<void> {
    // no-op for now — if you later implement buffering you can flush pending batches
  }
}
