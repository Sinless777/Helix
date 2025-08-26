// libs/email/src/lib/email.module.ts
// -----------------------------------------------------------------------------
// EmailModule
// -----------------------------------------------------------------------------
// - Loads strongly-typed EmailConfig via ConfigModule.forFeature(emailConfig)
// - Registers the EmailTemplateEngine and EmailService
// - Exports EmailService (and TemplateEngine for convenience)
// -----------------------------------------------------------------------------

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { emailConfig } from './config/email.config'
import { EmailTemplateEngine } from './providers/template.engine'
import { EmailService } from './email.service'

@Module({
  // Pull the email configuration (paths, defaults, provider hints, etc.)
  imports: [ConfigModule.forFeature(emailConfig)],
  // Provide the template engine and the high-level EmailService
  providers: [EmailTemplateEngine, EmailService],
  // Consumers typically only need EmailService, but exporting the engine helps for tests
  exports: [EmailService, EmailTemplateEngine]
})
export class EmailModule {}
