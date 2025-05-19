import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from './user.service'
import { EntityManager } from '@mikro-orm/postgresql'
import { User } from './user.entity'
import * as bcrypt from 'bcrypt'

describe('UserService', () => {
  let service: UserService

  const mockUser: User = {
    id: 'user-id',
    email: 'user@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
    avatarUrl: undefined,
    gravatar: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    generateUuid: jest.fn(),
  }

  const mockEntityManager = {
    findOne: jest.fn(),
    find: jest.fn(),
    persistAndFlush: jest.fn(),
    removeAndFlush: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create and return a user', async () => {
      mockEntityManager.findOne.mockResolvedValue(null)
      mockEntityManager.persistAndFlush.mockResolvedValue(undefined)

      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashed-password' as never)

      const result = await service.create('user@example.com', 'Password123!')
      expect(result.email).toBe('user@example.com')
      expect(result.passwordHash).toBe('hashed-password')
    })

    it('should throw if email is missing', async () => {
      await expect(service.create('', 'password')).rejects.toThrow(
        'Email and password are required',
      )
    })

    it('should throw if user already exists', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockUser)
      await expect(
        service.create('user@example.com', 'password'),
      ).rejects.toThrow('User already exists')
    })
  })

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockUser)
      const result = await service.findByEmail('user@example.com')
      expect(result).toBe(mockUser)
    })
  })

  describe('findById', () => {
    it('should return user by ID', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockUser)
      const result = await service.findById('user-id')
      expect(result).toBe(mockUser)
    })
  })

  describe('update', () => {
    it('should update and return user', async () => {
      const updates = { name: 'New Name' }
      mockEntityManager.findOne.mockResolvedValue({ ...mockUser })

      const result = await service.update('user-id', updates)
      expect(result.name).toBe('New Name')
    })

    it('should throw if user not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null)
      await expect(service.update('missing-id', {})).rejects.toThrow(
        'User not found',
      )
    })
  })

  describe('delete', () => {
    it('should delete a user', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockUser)
      await expect(service.delete('user-id')).resolves.toBeUndefined()
    })

    it('should throw if user not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null)
      await expect(service.delete('bad-id')).rejects.toThrow('User not found')
    })
  })

  describe('checkPassword', () => {
    it('should return true for matching password', async () => {
      jest
        .spyOn(bcrypt, 'compare')
        .mockResolvedValue(true as never)

      const result = await service.checkPassword(mockUser, 'Password123!')
      expect(result).toBe(true)
    })

    it('should throw if no password is set', async () => {
      const userWithoutHash: User = {
        ...mockUser,
        passwordHash: undefined,
        generateUuid: jest.fn(), // ensure required method is present
      }
      await expect(
        service.checkPassword(userWithoutHash, 'test'),
      ).rejects.toThrow('User has no password set')
    })
  })

  describe('isValidPassword', () => {
    it('should validate strong password', async () => {
      const result = await service.isValidPassword('Strong1!')
      expect(result).toBe(true)
    })

    it('should reject weak password', async () => {
      const result = await service.isValidPassword('weak')
      expect(result).toBe(false)
    })
  })

  describe('isEmailInUse', () => {
    it('should return true if user exists', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockUser)
      const result = await service.isEmailInUse('test@example.com')
      expect(result).toBe(true)
    })

    it('should return false if user does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValue(null)
      const result = await service.isEmailInUse('test@example.com')
      expect(result).toBe(false)
    })
  })

  describe('isValidId', () => {
    it('should return true for existing ID', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockUser)
      const result = await service.isValidId('user-id')
      expect(result).toBe(true)
    })

    it('should return false for missing ID', async () => {
      mockEntityManager.findOne.mockResolvedValue(null)
      const result = await service.isValidId('missing-id')
      expect(result).toBe(false)
    })
  })
})
