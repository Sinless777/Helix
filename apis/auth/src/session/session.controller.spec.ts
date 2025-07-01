import { Test, TestingModule } from '@nestjs/testing'
import { SessionController } from './session.controller'
import { SessionService } from './session.service'
import { Session } from './session.entity'
import { User } from '../user/user.entity'

describe('SessionController', () => {
  let controller: SessionController
  let service: SessionService

  const mockSession = new Session()
  mockSession.id = 'session-id'

  const mockUser = new User()
  mockUser.id = 'user-id'
  mockUser.email = 'user@example.com'

  const mockSessionService = {
    em: {
      findOne: jest.fn().mockResolvedValue(mockUser),
    },
    createSession: jest.fn().mockResolvedValue(mockSession),
    findById: jest.fn().mockResolvedValue(mockSession),
    findAllByUser: jest.fn().mockResolvedValue([mockSession]),
    revokeSession: jest.fn().mockResolvedValue(mockSession),
    revokeAllSessionsForUser: jest.fn().mockResolvedValue([mockSession]),
    deleteSession: jest.fn().mockResolvedValue(undefined),
    deleteAllSessionsForUser: jest.fn().mockResolvedValue(undefined),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
      ],
    }).compile()

    controller = module.get<SessionController>(SessionController)
    service = module.get<SessionService>(SessionService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a session for a user', async () => {
      const body = {
        userId: 'user-id',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        geoLocation: 'NY',
        geoIP: '8.8.8.8',
      }

      const result = await controller.create(body)
      expect(result).toBe(mockSession)
      expect(service.em.findOne).toHaveBeenCalledWith(User, { id: 'user-id' })
      expect(service.createSession).toHaveBeenCalledWith(
        mockUser,
        body.ipAddress,
        body.userAgent,
        body.geoLocation,
        body.geoIP,
      )
    })
  })

  describe('getSession', () => {
    it('should return a session by id', async () => {
      const result = await controller.getSession('session-id')
      expect(result).toBe(mockSession)
      expect(service.findById).toHaveBeenCalledWith('session-id')
    })
  })

  describe('getUserSessions', () => {
    it('should return all sessions for a user', async () => {
      const result = await controller.getUserSessions('user-id')
      expect(result).toEqual([mockSession])
      expect(service.em.findOne).toHaveBeenCalledWith(User, { id: 'user-id' })
      expect(service.findAllByUser).toHaveBeenCalledWith(mockUser)
    })
  })

  describe('revoke', () => {
    it('should revoke a session', async () => {
      const result = await controller.revoke('session-id')
      expect(result).toBe(mockSession)
      expect(service.revokeSession).toHaveBeenCalledWith('session-id')
    })
  })

  describe('revokeAll', () => {
    it('should revoke all sessions for a user', async () => {
      const result = await controller.revokeAll('user-id')
      expect(result).toEqual([mockSession])
      expect(service.revokeAllSessionsForUser).toHaveBeenCalledWith(mockUser)
    })
  })

  describe('deleteSession', () => {
    it('should delete a session by id', async () => {
      await controller.deleteSession('session-id')
      expect(service.deleteSession).toHaveBeenCalledWith('session-id')
    })
  })

  describe('deleteAllSessions', () => {
    it('should delete all sessions for a user', async () => {
      await controller.deleteAllSessions('user-id')
      expect(service.deleteAllSessionsForUser).toHaveBeenCalledWith(mockUser)
    })
  })
})
