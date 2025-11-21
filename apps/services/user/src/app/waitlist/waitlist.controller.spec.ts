import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';
import {
  CreateWaitlistDto,
  UpdateWaitlistStatusDto,
} from './waitlist.dto';

describe('WaitlistController', () => {
  let controller: WaitlistController;
  let service: jest.Mocked<WaitlistService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<WaitlistService> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      updateStatus: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaitlistController],
      providers: [
        {
          provide: WaitlistService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get(WaitlistController);
    service = module.get(WaitlistService) as jest.Mocked<WaitlistService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to WaitlistService.create', async () => {
      const dto: CreateWaitlistDto = {
        email: 'test@example.com',
        name: 'John Doe',
        source: 'landing',
        refCode: 'REF123',
        cohort: 'alpha',
        metadata: { foo: 'bar' },
      };

      const mockResult = { id: '1', ...dto };
      service.create.mockResolvedValue(mockResult as any);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockResult);
    });
  });

  describe('findAll', () => {
    it('should delegate to WaitlistService.findAll', async () => {
      const mockResult = [{ id: '1' }, { id: '2' }];
      service.findAll.mockResolvedValue(mockResult as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });
  });

  describe('findOne', () => {
    it('should delegate to WaitlistService.findByEmail', async () => {
      const email = 'test@example.com';
      const mockEntry = { id: '1', email };
      service.findByEmail.mockResolvedValue(mockEntry as any);

      const result = await controller.findOne(email);

      expect(service.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBe(mockEntry);
    });
  });

  describe('updateStatus', () => {
    it('should delegate to WaitlistService.updateStatus', async () => {
      const email = 'test@example.com';
      const dto: UpdateWaitlistStatusDto = { status: 'invited' };
      const mockEntry = { id: '1', email, status: 'invited' };

      service.updateStatus.mockResolvedValue(mockEntry as any);

      const result = await controller.updateStatus(email, dto);

      expect(service.updateStatus).toHaveBeenCalledWith(email, dto.status);
      expect(result).toBe(mockEntry);
    });
  });
});
