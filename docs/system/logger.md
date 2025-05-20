# Logger System Design

This document outlines the Helix Logger’s requirements, schema, configuration, and usage, ready for implementation.

---

## 1. Supported Drivers

* **Console**: always enabled; colored, human-readable output.
* **File**: default storage; human-readable text logs.
* **Redis**: cache via per-category streams (key `logs:<category>`) with 24h TTL eviction.
* **Loki**: optional, with label configuration; emits structured JSON.
* **OpenTelemetry (OTEL)**: optional; exports logs, metrics, and traces via OTLP.
* **Fluentd**: optional; structured JSON transport.
* **Elasticsearch**: optional; structured JSON transport.

Drivers are registered by name:

```ts
registerDriver(name: string, driver: DriverBase): void
```

Lazy initialization: only **Console** and **File** load at startup; others initialize on first use or via explicit `logger.init('loki')`.

---

## 2. Log Record Schema

```ts
interface LogMetadata {
  traceId?: string;
  spanId?: string;
  userId?: string;
  service?: string;
  version?: string;
  host?: string;
  pid?: number;
  env?: string;
  otelSpan?: string;
  [key: string]: any; // arbitrary extra fields
}

interface LogRecord {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug' | 'trace' | 'fatal' | 'success';
  message: string;
  context?: string;
  metadata?: LogMetadata;
}
```

---

## 3. Routing Rules

Dynamic, JSON/TypeScript-based rules loaded at startup and modifiable at runtime via `updateConfig()` or tRPC + MikroORM.

```ts
interface RouteRule {
  id: string;                // unique ID
  enabled: boolean;
  description: string;
  pattern?: string;          // glob (e.g. "transactions.*"); undefined = all
  levels?: LogLevel[];       // e.g. ['error','warn']; undefined = all
  drivers: string[];         // target driver names (e.g. ['elasticsearch','file'])
}
```

* **Default routing**: everything → File + Console (Console is non-disableable).
* **Matching**: Category glob + level; **first-match wins** (primary). Others receive a fallback notification with a pointer to the primary storage location.
* **Updates**: `logger.updateConfig(rules: RouteRule[]): Promise<void>`; tRPC endpoints for getAll, getById, add, update, remove, reloadDriver, reloadConfig.
* **Persistence**: rules stored encrypted (AES-256-GCM) in CockroachDB via MikroORM; secret key from `process.env.LOGGER_ENCRYPTION_KEY`.

---

## 4. Formatters

Pluggable per-driver formatter functions:

```ts
interface Formatter {
  format(record: LogRecord): string;
}
```

* **ConsoleFormatter**: human-readable with colors.
* **FileFormatter**: human-readable text.
* **JSONFormatter**: `stringified JSON` for structured transports (Redis, Loki, Fluentd, Elasticsearch, OTEL).

---

## 5. Buffering & Batching

High-throughput drivers support batching:

* **Max batch size**: 100 records (hard limit).
* **Max flush interval**: 5 seconds (hard limit).
* **Async background flush**: enabled.
* **Graceful shutdown**: automatic `process.on('exit')` hook flushes pending logs.

---

## 6. Failure Handling

On driver errors (e.g. network outages):

1. **Retry**: exponential backoff with jitter.
2. **Emit**: special `driver.error` log to the Console immediately.
3. **Callback**: fire `onDriverError(driverName: string, err: Error)` for application alerts.
4. **Fallback**: send a fallback record to other drivers.

Example API:

```ts
logger.onDriverError((driverName, error) => { /* alert or metrics */ });
```

---

## 7. Framework Integration

### NestJS, Express, Next.js

* **Middleware**: plug-and-play request logging (method, URL, headers, userId).
* **Decorator**: `@Log({ category: string, level: LogLevel })` on methods.
* **Error Logging**: global exception filter.
* **Audit Trails**: always tag logs with category (no separate `logger.audit()`).

---

## 8. OpenTelemetry Integration

* **Log Export**: OTLP via existing OTEL SDK.
* **Metrics**: internal counters per log level.
* **Traces**: correlate `LogRecord.metadata.traceId/spanId` with OTEL spans.
* **Spans**: optional spans around logging calls.

---

## 9. Redis Streams

* **Streams**: per-category, key `logs:<category>`.
* **Eviction**: TTL=24h (no manual trimming).
* **Usage**: push each record to the stream.

---

## 10. API & Hooks

```ts
interface Logger {
  log(record: LogRecord, category: string): void;
  updateConfig(rules: RouteRule[]): Promise<void>;
  registerDriver(name: string, driver: DriverBase): void;
  initDriver(name: string): Promise<void>;
  shutdown(): Promise<void>;
  onDriverError(callback: (driver: string, error: Error) => void): void;
}
```

* **tRPC Server**: built-in router mounted into the existing backend for config CRUD + driver reload.
* **Dynamic Config**: subscribes to CockroachDB changes and polls for updates.

---

*Use this as the definitive prompt for recreating or extending the Helix Logger system.*
