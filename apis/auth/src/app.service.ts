import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/**
 * AppService provides utility methods for health checks
 * and accessing configuration values.
 */
@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Returns a basic health check message.
   *
   * @returns {string} Health status message
   */
  getHealthStatus(): string {
    return '✅ Auth service is running'
  }

  /**
   * Retrieves the current environment mode (e.g., development, production).
   *
   * @returns {string} The value of NODE_ENV or 'development' if not set
   */
  getEnvironment(): string {
    return this.configService.get<string>('NODE_ENV') || 'development'
  }

  /**
   * Retrieves the database configuration values from environment variables.
   *
   * @returns {{ host?: string; port?: number; dbName?: string; user?: string }}
   * An object containing DB_HOST, DB_PORT, DB_NAME, and DB_USER
   */
  getDatabaseConfig(): {
    host?: string
    port?: number
    dbName?: string
    user?: string
  } {
    return {
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      dbName: this.configService.get<string>('DB_NAME'),
      user: this.configService.get<string>('DB_USER'),
    }
  }
}
