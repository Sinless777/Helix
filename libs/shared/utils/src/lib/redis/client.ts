import Redis, { type RedisOptions } from 'ioredis';
import { createClient as createNodeRedisClient, type RedisClientType } from 'redis';

export type RedisClientOptions = RedisOptions | string;

export const createRedisClient = (options?: RedisClientOptions): Redis => {
  if (typeof options === 'string') {
    return new Redis(options);
  }
  if (options) {
    return new Redis(options);
  }
  const url = process.env.REDIS_URL ?? '';
  return new Redis(url);
};

export const createRedisV4Client = (url = process.env.REDIS_URL ?? ''): RedisClientType => {
  return createNodeRedisClient({ url });
};

export const redisClient = createRedisClient();
