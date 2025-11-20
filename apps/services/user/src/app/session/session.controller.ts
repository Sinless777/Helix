import { Body, Controller, Get, Param, Post, Delete } from '@nestjs/common';
import { SessionService } from './session.service';
import {
  CreateSessionDto,
  ValidateSessionDto,
  RevokeSessionDto,
} from './session.dto';

@Controller('session')
export class SessionController {
  constructor(private readonly service: SessionService) {}

  @Post()
  create(@Body() dto: CreateSessionDto): any {
    return this.service.createSession(dto);
  }

  @Post('validate')
  validate(@Body() dto: ValidateSessionDto): any {
    return this.service.validateSession(dto);
  }

  @Delete()
  revoke(@Body() dto: RevokeSessionDto): any {
    return this.service.revokeSession(dto);
  }

  @Get('user/:userId')
  list(@Param('userId') userId: string): any {
    return this.service.listSessions(userId);
  }

  @Delete('user/:userId')
  revokeAll(@Param('userId') userId: string): any {
    return this.service.revokeAllForUser(userId);
  }
}
