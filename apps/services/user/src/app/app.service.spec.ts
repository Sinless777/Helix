import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  let mockRootNode: { get: jest.Mock };
  let mockHypertune: { root?: jest.Mock };

  beforeEach(async () => {
    mockRootNode = {
      get: jest.fn().mockReturnValue({ permissionsSystem: true }),
    };

    mockHypertune = {
      root: jest.fn().mockReturnValue(mockRootNode),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: 'HYPERTUNE',
          useValue: mockHypertune,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return status with hypertune data when available', () => {
    const rootSpy = mockHypertune.root as jest.Mock;
    const status = service.getStatus();

    expect(rootSpy).toHaveBeenCalledTimes(1);
    expect(mockRootNode.get).toHaveBeenCalledWith(
      expect.objectContaining({
        fallback: expect.objectContaining({ permissionsSystem: false }),
      }),
    );
    expect(status).toMatchObject({
      ok: true,
      environment: 'test',
      hypertuneAttached: true,
      permissionsSystem: true,
    });
  });

  it('should fallback gracefully when hypertune root is missing', () => {
    mockHypertune.root = undefined;

    const status = service.getStatus();

    expect(status.permissionsSystem).toBe(false);
    expect(status.hypertuneAttached).toBe(true);
  });
});
