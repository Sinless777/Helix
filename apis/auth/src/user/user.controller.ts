// apis/auth/src/user/user.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<User> {
    const { email, password } = dto;

    const emailInUse = await this.userService.isEmailInUse(email);
    if (emailInUse) {
      throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
    }

    const validPassword = await this.userService.isValidPassword(password);
    if (!validPassword) {
      throw new HttpException(
        'Password does not meet security requirements',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.userService.create(email, password);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.all();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updates: Partial<User>,
  ): Promise<User> {
    return this.userService.update(id, updates);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.delete(id);
    return { message: 'User deleted successfully' };
  }
}
