# redis

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test redis` to execute the unit tests via [Jest](https://jestjs.io).

```bash
libs/
└─ redis/
   └─ src/
      ├─ index.ts
      └─ lib/
         ├─ redis.module.ts                 # Global/feature module with forRoot/Async
         ├─ redis.constants.ts              # Key prefixes, default TTLs
         ├─ redis.tokens.ts                 # DI tokens (REDIS, REDIS_SUB, OPTIONS)
         ├─ redis.types.ts                  # Option interfaces, result types
         │
         ├─ config/
         │  └─ redis.config.ts              # Parse env → options (host, db, TLS, etc.)
         │
         ├─ clients/
         │  ├─ redis.factory.ts             # Creates Redis/Cluster clients
         │  ├─ redis.client.ts              # Thin wrapper (get/set/json/pipeline helpers)
         │  └─ redis.subscriber.ts          # Pub/Sub or keyspace notifications client
         │
         ├─ utils/
         │  ├─ key.util.ts                  # Key builders: user:session:{id}, jti:{uuid}, etc.
         │  ├─ ttl.util.ts                  # TTL helpers (ms/sec), per-scope defaults
         │  ├─ json.util.ts                 # Safe JSON stringify/parse
         │  ├─ hash.util.ts                 # Fingerprint/hash helpers for device/IP
         │  └─ rate-limit.util.ts           # Sliding window/token bucket primitives
         │
         ├─ repositories/
         │  ├─ cache.repository.ts          # Simple cache get/set/del with namespacing
         │  ├─ rate-limit.repository.ts     # Incr/expire + sliding window ops
         │  ├─ otp.repository.ts            # Email/SMS code store (code + tries + TTL)
         │  ├─ session.repository.ts        # Session store (bearer session ids)
         │  ├─ refresh-token.repository.ts  # Rotating refresh tokens (metadata)
         │  └─ jti.repository.ts            # Reuse detection blacklist/seen set
         │
         ├─ health/
         │  └─ redis.health.ts              # @nestjs/terminus health indicator
         │
         ├─ decorators/
         │  └─ cache-ttl.decorator.ts       # Optional: per-handler cache TTL hint
         │
         └─ interceptors/
            └─ cache.interceptor.ts         # Optional: response caching via Redis
```
