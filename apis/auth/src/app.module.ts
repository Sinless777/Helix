// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SessionModule } from './session/session.module';
import { MfaModule } from './mfa/mfa.module';
import { DeviceModule } from './device/device.module';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available throughout the application
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgresql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        dbName: configService.get<string>('DB_NAME'),
        user: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        autoLoadEntities: true,
        forceUtcTimezone: true,
        debug: true,
      }),
      inject: [ConfigService],
    }),
    JwtModule.register({}), // or registerAsync with ConfigService
    AuthModule,
    UserModule,
    SessionModule,
    MfaModule,
    DeviceModule,
    ThrottlerModule.forRoot({ ttl: 60, limit: 5 }), // for rate-limiting
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
