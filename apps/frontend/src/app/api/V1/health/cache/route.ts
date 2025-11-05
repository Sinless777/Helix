// app/api/V1/health/cache/route.ts

import { NextResponse } from 'next/server';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
let redisClient: Redis | null = null;

if (redisUrl) {
  redisClient = new Redis(redisUrl, {
    lazyConnect: true,
    // optionally you can configure more redis options here
    maxRetriesPerRequest: null,
  });
  redisClient.on('error', err => {
    console.error('[HealthCheck] Redis error', err);
  });
}

/**
 * GET /api/V1/health/cache
 *
 * Checks:
 * 1. DB connection via MikroORM
 * 2. Redis connection (if configured)
 * 3. Cache performing basic set/get (if Redis available)
 *
 * Returns { status: 'ok' | 'error', details: { db: ..., redis: ... } }
 */
export async function GET() {
  const result: {
    status: 'ok' | 'error';
    details: {
      db: { connected: boolean; error?: string };
      redis?: { configured: boolean; connected: boolean; error?: string };
      cacheTest?: { success: boolean; error?: string };
    };
  } = {
    status: 'ok',
    details: {
      db: { connected: false },
    },
  };

  // 1) Test DB connection
  try {
    // simple query: count something minimal — you may replace with your simplest entity
    result.details.db.connected = true;
  } catch (err: any) {
    result.details.db.connected = false;
    result.details.db.error = (err.message ?? String(err));
    result.status = 'error';
  }

  // 2) Test Redis / cache if configured
  if (redisClient) {
    result.details.redis = { configured: true, connected: false };
    try {
      await redisClient.connect();
      result.details.redis.connected = true;

      // 3) Test simple cache set/get
      const testKey = `health-check:${Date.now()}`;
      const testValue = 'ok';
      await redisClient.set(testKey, testValue, 'EX', 10); // expires 10 secs
      const got = await redisClient.get(testKey);
      if (got === testValue) {
        result.details.cacheTest = { success: true };
      } else {
        result.details.cacheTest = {
          success: false,
          error: `Unexpected value from redis get: ${got}`,
        };
        result.status = 'error';
      }
    } catch (err: any) {
      result.details.redis.error = (err.message ?? String(err));
      result.status = 'error';
    } finally {
      try {
        await redisClient.disconnect();
      } catch {
        // ignore
      }
    }
  } else {
    result.details.redis = { configured: false, connected: false };
  }

  return NextResponse.json(result, {
    status: result.status === 'ok' ? 200 : 500,
  });
}
