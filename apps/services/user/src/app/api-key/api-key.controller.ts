// apps/services/user/src/app/api-key/api-key.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from './api-key.dto';

@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly service: ApiKeyService) {}

  @Post()
  create(@Body() dto: CreateApiKeyDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Get()
  list(
    @Query('userId') userId?: string,
    @Query('orgId') orgId?: string,
  ) {
    if (userId) return this.service.listByUser(userId);
    if (orgId) return this.service.listByOrg(orgId);
    return [];
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateApiKeyDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  revoke(
    @Param('id') id: string,
    @Query('reason') reason?: string,
  ) {
    return this.service.revoke(id, reason);
  }

  @Post(':id/mark-used')
  markUsed(@Param('id') id: string) {
    return this.service.markUsed(id);
  }
}
