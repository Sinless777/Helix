/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { helixLogger } from './logger';
import { HelixNestLogger } from './logger.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const nestLogger = new HelixNestLogger(helixLogger);
  app.useLogger(nestLogger);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3001;
  await app.listen(port);
  helixLogger.info('user-service listening', {
    url: `http://localhost:${port}/${globalPrefix}`,
    port,
    prefix: globalPrefix,
    environment: process.env.NODE_ENV || 'development',
  });
}

bootstrap();
