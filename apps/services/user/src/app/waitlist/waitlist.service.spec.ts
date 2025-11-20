import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';

import { WaitlistService } from './waitlist.service';
import { WaitlistEntry } from '@helix-ai/db/entities';
import { CreateWaitlistDto } from './waitlist.dto';

describe('WaitlistService', () => {
  let service: WaitlistService;
  let em: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    em = {
      create: jest.fn(),
      persistAndFlush: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      flush: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistService,
        {
          provide: EntityManager,
          useValue: em,
        },
      ],
    }).compile();

    service = module.get(WaitlistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and persist a waitlist entry', async () => {
      const dto: CreateWaitlistDto = {
        email: 'Test@Email.com',
        name: 'John Doe',
        source: 'landing',
        refCode: 'REF123',
        cohort: 'alpha',
        metadata: { test: true },
      };

      const mockEntry = { id: '123', ...dto };
      em.create.mockReturnValue(mockEntry);

      const result = await service.create(dto);

      expect(em.create).toHaveBeenCalledWith(WaitlistEntry, expect.objectContaining({
        email: 'test@email.com',
        name: 'John Doe',
      }));

      expect(em.persistAndFlush).toHaveBeenCalledWith(mockEntry);
      expect(result).toBe(mockEntry);
    });
  });

  describe('findAll', () => {
    it('should return all waitlist entries', async () =>     {
      const mockEntries = [{ id: 1 }, { id: 2 }];
      em.find.mockResolvedValue(mockEntries as any);

      const result = await service.findAll();

      expect(em.find).toHaveBeenCalledWith(
        WaitlistEntry,
        {},
        { orderBy: { createdAt: 'DESC' } },
      );
      expect(result).toBe(mockEntries);
    });
  });

  describe('findByEmail', () => {
    it('should return the entry if found', async () => {
      const mockEntry = { id: 'abc', email: 'test@email.com' };
      em.findOne.mockResolvedValue(mockEntry as any);

      const result = await service.findByEmail('Test@Email.com');

      expect(em.findOne).toHaveBeenCalledWith(WaitlistEntry, {
        email: 'test@email.com',
      });
      expect(result).toBe(mockEntry);
    });

    it('should throw NotFoundException if not found', async () => {
      em.findOne.mockResolvedValue(null);

      await expect(service.findByEmail('missing@email.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update the status of an entry', async () => {
      const mockEntry: any = {
        email: 'test@email.com',
        status: 'pending',
        updatedAt: new Date(),
      };

      em.findOne.mockResolvedValue(mockEntry);

      const result = await service.updateStatus('test@email.com', 'approved');

      expect(mockEntry.status).toBe('approved');
      expect(em.flush).toHaveBeenCalled();
      expect(result).toBe(mockEntry);
    });

    it('should throw if entry not found', async () => {
      em.findOne.mockResolvedValue(null);

      await expect(service.updateStatus('missing@email.com', 'approved'))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});
