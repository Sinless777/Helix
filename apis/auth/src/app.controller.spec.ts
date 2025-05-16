// apis/auth/src/app.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
    appService = moduleRef.get<AppService>(AppService);
  });

  it('should return health status', () => {
    expect(appController.getHealthStatus()).toBe('OK');
  });

  it('should return current environment', () => {
    const env = process.env.NODE_ENV || 'development';
    expect(appController.getEnvironment()).toBe(env);
  });

  it('should return database config', () => {
    const dbConfig = appService.getDatabaseConfig();
    expect(dbConfig).toHaveProperty('host');
    expect(dbConfig).toHaveProperty('port');
    expect(dbConfig).toHaveProperty('dbName');
    expect(dbConfig).toHaveProperty('user');
  });
});
