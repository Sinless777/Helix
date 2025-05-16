// apis/auth/src/app.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 
   * @returns Health status message
   * @description This method returns a health status message indicating that the auth service is running.
   * It can be used for health checks in the application.
   */
  getHealthStatus(): string {
    return '✅ Auth service is running';
  }

  /**
   * 
   * @returns Environment variable
   * @description This method retrieves the current environment variable from the ConfigService.
   * It uses the ConfigService to get the value of NODE_ENV.
   * If NODE_ENV is not set, it defaults to 'development'.
   */
  getEnvironment(): string {
    return this.configService.get<string>('NODE_ENV') || 'development';
  }

  /**
   * 
   * @returns Database configuration object
   * @description This method retrieves the database configuration from the environment variables.
   * It uses the ConfigService to get the values for host, port, dbName, and user.
   * The values are expected to be set in the environment variables.
   * If any of the values are not set, it will return undefined for that property.
   * The returned object can be used to configure the database connection in the application.
   */
  getDatabaseConfig() {
    return {
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      dbName: this.configService.get<string>('DB_NAME'),
      user: this.configService.get<string>('DB_USER'),
    };
  }
}
