import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { JwtModule } from '@nestjs/jwt'
import { ThrottlerModule } from '@nestjs/throttler'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { SessionModule } from './session/session.module'
import { MfaModule } from './mfa/mfa.module'
import { DeviceModule } from './device/device.module'


@Module({
  imports: [
    // Global .env config
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // MikroORM Postgres setup
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgresql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        dbName: config.get<string>('DB_NAME'),
        user: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        autoLoadEntities: true,
        forceUtcTimezone: true,
        debug: true,
      }),
    }),

    // JWT setup (using env for flexibility)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || '15m',
        },
      }),
    }),

    // Rate limiting (per IP)
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 5,
    }),

    // Feature modules
    AuthModule,
    UserModule,
    SessionModule,
    MfaModule,
    DeviceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
