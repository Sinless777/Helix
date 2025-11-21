// apps/services/user/src/app/app.module.ts
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ormConfig } from '@helix-ai/db'; // ensure this is exported by the db lib
import { AppController } from './app.controller';
import { AppService } from './app.service';

/* Import feature modules */
import { WaitlistModule } from './waitlist/waitlist.module';
import { VerificationTokenModule } from './verification-token/verification-token.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { UserModule } from './user/user.module';
import { SignupModule } from './signup/signup.module';
import { SessionModule } from './session/session.module';
import { AccountModule } from './account/account.module';
import { LoginModule } from './login/login.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { OrgSettingsModule } from './org-settings/org-settings.module';
import { OrgMemberModule } from './org-member/org-member.module';
import { OrgModule } from './org/org.module';
import { HypertuneModule } from './hypertune.module';


const MIkroOrmConfig  = {
  ...ormConfig,
  database: 'postgres'
}

@Module({
  imports:[
    MikroOrmModule.forRoot(MIkroOrmConfig),
    WaitlistModule,
    VerificationTokenModule,
    UserSettingsModule,
    UserProfileModule,
    UserModule,
    SignupModule,
    SessionModule,
    AccountModule,
    LoginModule,
    ApiKeyModule,
    OrgSettingsModule,
    OrgMemberModule,
    OrgModule,
    HypertuneModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
