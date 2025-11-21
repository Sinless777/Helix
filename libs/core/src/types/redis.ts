export interface RedisConfig {
    url?: string;
    host?: string;
    username?: string;
    password?: string;
    port?: number;
    cachePrefix?: string;
    cacheExpirationMs?: number;
}