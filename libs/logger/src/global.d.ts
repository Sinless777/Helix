// libs/shared/logger/src/global.d.ts

// Stub out modules without shipped types:
declare module "nest-winston";
declare module "winston-elasticsearch";
declare module "winston-annotate";
declare module "winston-loki";

// allow imports of untyped transport modules
declare module "fluent-logger";
declare module "winston3-logstash-transport";
declare module "winston-redis";
