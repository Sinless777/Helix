import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.service.findByEmail(email);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/password')
  updatePassword(@Param('id') id: string, @Body() dto: UpdatePasswordDto) {
    return this.service.updatePassword(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
