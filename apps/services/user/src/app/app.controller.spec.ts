import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  const mockService = {
    getStatus: jest.fn().mockReturnValue({
      ok: true,
      environment: 'test',
      hypertuneAttached: true,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health status', () => {
    const result = controller.getStatus();

    expect(result).toEqual({
      ok: true,
      environment: 'test',
      hypertuneAttached: true,
    });

    expect(mockService.getStatus).toHaveBeenCalled();
  });
});
