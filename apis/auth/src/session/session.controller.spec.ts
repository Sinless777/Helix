// apis/auth/src/session/session.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { User } from '../user/user.entity';
import { Session } from './session.entity';

describe('SessionController', () => {
  let controller: SessionController;
  let service: SessionService;

  const mockSessionService = {
    createSession: jest.fn(),
    findById: jest.fn(),
    findAllByUser: jest.fn(),
    revokeSession: jest.fn(),
    deleteSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
      ],
    }).compile();

    controller = module.get<SessionController>(SessionController);
    service = module.get<SessionService>(SessionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findSessionById', () => {
    it('should return a session by id', async () => {
      const session = new Session();
      session.id = 'session-id';
      mockSessionService.findById.mockResolvedValue(session);

      const result = await controller.findSessionById('session-id');
      expect(result).toBe(session);
      expect(mockSessionService.findById).toHaveBeenCalledWith('session-id');
    });
  });

  describe('deleteSession', () => {
    it('should delete a session by id', async () => {
      mockSessionService.deleteSession.mockResolvedValue(undefined);

      await controller.deleteSession('session-id');
      expect(mockSessionService.deleteSession).toHaveBeenCalledWith(
        'session-id',
      );
    });
  });

  describe('revokeSession', () => {
    it('should revoke a session by id', async () => {
      const session = new Session();
      session.id = 'session-id';
      mockSessionService.revokeSession.mockResolvedValue(session);

      const result = await controller.revokeSession('session-id');
      expect(result).toBe(session);
      expect(mockSessionService.revokeSession).toHaveBeenCalledWith(
        'session-id',
      );
    });
  });

  describe('getSessionsForUser', () => {
    it('should return all sessions for a user', async () => {
      const user = new User();
      user.id = 'user-id';

      const session1 = new Session();
      session1.user = user;
      const session2 = new Session();
      session2.user = user;

      mockSessionService.findAllByUser.mockResolvedValue([session1, session2]);

      const result = await controller.getSessionsForUser(user);
      expect(result).toHaveLength(2);
      expect(mockSessionService.findAllByUser).toHaveBeenCalledWith(user);
    });
  });
});
