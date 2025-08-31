export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GEOIP_CITY_DB_PATH?: string;
      GEOIP_ASN_DB_PATH?: string;
      DB_AUDIT_ENABLED?: 'true' | 'false';
      NODE_ENV?: 'development' | 'production' | 'test';
      DB_URL?: string;
      DB_POOL_MAX?: string;
    }
  }
}
