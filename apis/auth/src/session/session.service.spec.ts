import { Test, TestingModule } from '@nestjs/testing'
import { SessionService } from './session.service'
import { Session } from './session.entity'
import { User } from '../user/user.entity'
import { EntityManager } from '@mikro-orm/postgresql'
import { HttpService } from '@nestjs/axios'
import { of } from 'rxjs'

describe('SessionService', () => {
  let service: SessionService

  const mockUser: User = {
    id: 'user-id',
    email: 'user@example.com',
    passwordHash: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
    generateUuid: jest.fn(),
  }

  const mockSession = new Session()
  mockSession.id = 'session-id'
  mockSession.user = mockUser
  mockSession.ipAddress = '127.0.0.1'
  mockSession.userAgent = 'Mozilla/5.0'
  mockSession.createdAt = new Date()
  mockSession.updatedAt = new Date()
  mockSession.revoked = false

  const mockEntityManager = {
    persistAndFlush: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    removeAndFlush: jest.fn(),
  }

  const mockHttpService = {
    get: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile()

    service = module.get<SessionService>(SessionService)
    jest.clearAllMocks()
  })

  describe('createSession', () => {
    it('should create and return a session', async () => {
      mockEntityManager.persistAndFlush.mockResolvedValue(undefined)

      const session = await service.createSession(
        mockUser,
        '127.0.0.1',
        'Mozilla/5.0',
        'NY',
        '8.8.8.8',
      )

      expect(session.user).toBe(mockUser)
      expect(session.ipAddress).toBe('127.0.0.1')
      expect(session.userAgent).toBe('Mozilla/5.0')
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledWith(session)
    })
  })

  describe('fetchGeoIPInformation', () => {
    it('should return geo data for valid IP', async () => {
      mockHttpService.get.mockReturnValue(
        of({ status: 200, data: { city: 'New York' } }),
      )
      const result = await service.fetchGeoIPInformation('127.0.0.1')
      expect(result).toEqual({ city: 'New York' })
    })

    it('should throw on invalid IP', async () => {
      await expect(
        service.fetchGeoIPInformation('invalid-ip'),
      ).rejects.toThrow('Invalid IP address format.')
    })
  })

  describe('fetchDeviceInformation', () => {
    it('should return device info for valid agent', async () => {
      mockHttpService.get.mockReturnValue(
        of({ status: 200, data: { device: 'Desktop' } }),
      )
      const result = await service.fetchDeviceInformation('Mozilla/5.0')
      expect(result).toEqual({ device: 'Desktop' })
    })

    it('should throw on invalid agent', async () => {
      await expect(service.fetchDeviceInformation('xyz')).rejects.toThrow(
        'Invalid user agent format.',
      )
    })
  })

  describe('validateIpAddress', () => {
    it('should return true for valid IPv4', () => {
      expect(service.validateIpAddress('127.0.0.1')).toBe(true)
    })

    it('should return false for invalid IP', () => {
      expect(service.validateIpAddress('999.999.999.999')).toBe(false)
    })
  })

  describe('validateUserAgent', () => {
    it('should validate a correct agent', () => {
      expect(service.validateUserAgent('Mozilla/5.0')).toBe(true)
    })

    it('should reject invalid agent', () => {
      expect(service.validateUserAgent('xyz')).toBe(false)
    })
  })

  describe('findById', () => {
    it('should find a session by ID', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockSession)
      const result = await service.findById('session-id')
      expect(result).toBe(mockSession)
    })
  })

  describe('findAllByUser', () => {
    it('should return all sessions for user', async () => {
      mockEntityManager.find.mockResolvedValue([mockSession])
      const result = await service.findAllByUser(mockUser)
      expect(result).toEqual([mockSession])
    })
  })

  describe('revokeSession', () => {
    it('should revoke a session', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockSession)
      const result = await service.revokeSession('session-id')
      expect(result?.revoked).toBe(true)
    })

    it('should return null if session not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null)
      const result = await service.revokeSession('invalid-id')
      expect(result).toBeNull()
    })
  })

  describe('deleteSession', () => {
    it('should delete a session if valid', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockSession)
      await expect(service.deleteSession('session-id')).resolves.toBeUndefined()
    })

    it('should throw if session not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null)
      await expect(service.deleteSession('bad-id')).rejects.toThrow(
        'Session not found',
      )
    })
  })

  describe('deleteAllSessionsForUser', () => {
    it('should delete all sessions for a user', async () => {
      mockEntityManager.find.mockResolvedValue([mockSession])
      mockEntityManager.findOne.mockResolvedValue(mockSession)
      mockEntityManager.removeAndFlush.mockResolvedValue(undefined)

      await expect(
        service.deleteAllSessionsForUser(mockUser),
      ).resolves.toBeUndefined()
    })
  })
})
