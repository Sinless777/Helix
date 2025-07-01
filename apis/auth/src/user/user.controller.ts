import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/createUser.dto'
import { User } from './user.entity'

/**
 * Controller for managing user resources.
 * Provides endpoints for creating, retrieving, updating, and deleting users.
 */
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Creates a new user.
   *
   * @param dto - The DTO containing email and password
   * @returns {Promise<User>} The created user
   *
   * @throws {HttpException} If the email is already in use or the password is invalid
   *
   * @example
   * POST /users
   * {
   *   "email": "user@example.com",
   *   "password": "StrongPass123!"
   * }
   */
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<User> {
    const { email, password } = dto

    const emailInUse = await this.userService.isEmailInUse(email)
    if (emailInUse) {
      throw new HttpException('Email is already in use', HttpStatus.CONFLICT)
    }

    const validPassword = await this.userService.isValidPassword(password)
    if (!validPassword) {
      throw new HttpException(
        'Password does not meet security requirements',
        HttpStatus.BAD_REQUEST,
      )
    }

    return this.userService.create(email, password)
  }

  /**
   * Retrieves all users.
   *
   * @returns {Promise<User[]>} An array of all users
   */
  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.all()
  }

  /**
   * Retrieves a user by their ID.
   *
   * @param id - UUID of the user
   * @returns {Promise<User>} The found user
   *
   * @throws {HttpException} If user is not found
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findById(id)
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }
    return user
  }

  /**
   * Updates a user by ID.
   *
   * @param id - UUID of the user
   * @param updates - Partial updates for the user
   * @returns {Promise<User>} The updated user
   *
   * @throws {HttpException} If user is not found
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updates: Partial<User>,
  ): Promise<User> {
    return this.userService.update(id, updates)
  }

  /**
   * Deletes a user by ID.
   *
   * @param id - UUID of the user to delete
   * @returns {Promise<{ message: string }>} Success confirmation
   *
   * @throws {HttpException} If user is not found
   */
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.delete(id)
    return { message: 'User deleted successfully' }
  }
}
