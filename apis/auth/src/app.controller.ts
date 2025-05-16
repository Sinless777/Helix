// apis/auth/src/app.controller.ts

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * @returns Health status message
   * @description This method returns a health status message indicating that the auth service is running.
   * It can be used for health checks in the application.
   */
  @Get('health')
  getHealthStatus(): string {
    return this.appService.getHealthStatus();
  }

  /**
   * @returns Environment variable
   * @description This method retrieves the current environment variable from the ConfigService.
   * It uses the ConfigService to get the value of NODE_ENV.
   * If NODE_ENV is not set, it defaults to 'development'.
   */
  @Get('env')
  getEnvironment(): string {
    return this.appService.getEnvironment();
  }

  /**
   * @returns Database configuration object
   * @description This method retrieves the database configuration from the environment variables.
   * It uses the ConfigService to get the values for host, port, dbName, and user.
   * The values are expected to be set in the environment variables.
   * If any of the values are not set, it will return undefined for that property.
   * The returned object can be used to configure the database connection in the application.
   */
  @Get('config/db')
  getDatabaseConfig() {
    return this.appService.getDatabaseConfig();
  }
}
