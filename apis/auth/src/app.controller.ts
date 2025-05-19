import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

/**
 * AppController handles basic utility endpoints like health checks and environment info.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Returns a health check message.
   *
   * @returns {string} Health status
   */
  @Get('health')
  getHealthStatus(): string {
    return this.appService.getHealthStatus()
  }

  /**
   * Returns the current environment (e.g., development, production).
   *
   * @returns {string} Environment name
   */
  @Get('env')
  getEnvironment(): string {
    return this.appService.getEnvironment()
  }

  /**
   * Returns database configuration details.
   *
   * @returns {{ host?: string; port?: number; dbName?: string; user?: string }}
   */
  @Get('config/db')
  getDatabaseConfig(): {
    host?: string
    port?: number
    dbName?: string
    user?: string
  } {
    return this.appService.getDatabaseConfig()
  }
}
