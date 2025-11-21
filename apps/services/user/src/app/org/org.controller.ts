// apps/services/user/src/app/org/org.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OrgService } from './org.service';
import { CreateOrgDto, UpdateOrgDto } from './org.dto';

@Controller('orgs')
export class OrgController {
  constructor(private readonly service: OrgService) {}

  @Post()
  create(@Body() dto: CreateOrgDto) {
    return this.service.create(dto);
  }

  @Get()
  listAll() {
    return this.service.listAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Get('user/:userId')
  listForUser(@Param('userId') userId: string) {
    return this.service.listForUser(userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrgDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
