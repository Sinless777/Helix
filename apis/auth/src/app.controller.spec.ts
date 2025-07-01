import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { AppService } from './app.service'

describe('AppController', () => {
  let appController: AppController

  const mockAppService = {
    getHealthStatus: jest.fn(() => '✅ Auth service is running'),
    getEnvironment: jest.fn(() => process.env.NODE_ENV || 'development'),
    getDatabaseConfig: jest.fn(() => ({
      host: 'localhost',
      port: 5432,
      dbName: 'test_db',
      user: 'test_user',
    })),
  }

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile()

    appController = moduleRef.get<AppController>(AppController)
  })

  it('should return health status', () => {
    expect(appController.getHealthStatus()).toBe('✅ Auth service is running')
    expect(mockAppService.getHealthStatus).toHaveBeenCalled()
  })

  it('should return current environment', () => {
    const expectedEnv = process.env.NODE_ENV || 'development'
    expect(appController.getEnvironment()).toBe(expectedEnv)
    expect(mockAppService.getEnvironment).toHaveBeenCalled()
  })

  it('should return database config', () => {
    const config = appController.getDatabaseConfig()
    expect(config).toMatchObject({
      host: 'localhost',
      port: 5432,
      dbName: 'test_db',
      user: 'test_user',
    })
    expect(mockAppService.getDatabaseConfig).toHaveBeenCalled()
  })
})
