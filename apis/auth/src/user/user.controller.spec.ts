// apis/auth/src/user/user.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUser: User = {
    id: 'test-id',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
    generateUuid: jest.fn(),
  };

  const mockUserService = {
    create: jest.fn().mockResolvedValue(mockUser),
    findById: jest.fn().mockResolvedValue(mockUser),
    all: jest.fn().mockResolvedValue([mockUser]),
    update: jest.fn().mockResolvedValue(mockUser),
    delete: jest.fn().mockResolvedValue(undefined),
    isEmailInUse: jest.fn().mockResolvedValue(false),
    isValidPassword: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const result = await controller.create({
      email: mockUser.email,
      password: 'Password123!',
    });
    expect(result).toEqual(mockUser);
    expect(service.create).toHaveBeenCalledWith(mockUser.email, 'Password123!');
  });

  it('should get all users', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockUser]);
    expect(service.all).toHaveBeenCalled();
  });

  it('should get a user by id', async () => {
    const result = await controller.findById('test-id');
    expect(result).toEqual(mockUser);
    expect(service.findById).toHaveBeenCalledWith('test-id');
  });

  it('should update a user', async () => {
    const updates = { email: 'new@example.com' };
    const result = await controller.update('test-id', updates);
    expect(result).toEqual(mockUser);
    expect(service.update).toHaveBeenCalledWith('test-id', updates);
  });

  it('should delete a user', async () => {
    const result = await controller.remove('test-id');
    expect(result).toEqual({ message: 'User deleted successfully' });
    expect(service.delete).toHaveBeenCalledWith('test-id');
  });
});
