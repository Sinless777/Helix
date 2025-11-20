import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { LinkAccountDto, UpdateAccountDto } from './account.dto';

@Controller('accounts')
export class AccountController {
  constructor(private readonly service: AccountService) {}

  /**
   * Idempotent link: create or update provider account mapping.
   */
  @Post('link')
  link(@Body() dto: LinkAccountDto) {
    return this.service.linkAccount(dto);
  }

  /**
   * List all external accounts for a user.
   */
  @Get('user/:userId')
  listForUser(@Param('userId') userId: string) {
    return this.service.listForUser(userId);
  }

  /**
   * Get a single account by id.
   */
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  /**
   * Lookup by provider/accountId pair.
   */
  @Get()
  findByProviderAccount(
    @Query('provider') provider: string,
    @Query('accountId') accountId: string,
  ) {
    return this.service.findByProviderAccount(provider, accountId);
  }

  /**
   * Update displayName / managementUrl / status.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.service.update(id, dto);
  }

  /**
   * Unlink an external account from its user.
   */
  @Delete(':id')
  unlink(@Param('id') id: string) {
    return this.service.unlink(id);
  }
}
