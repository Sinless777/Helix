import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Simple root route — useful for health/liveness probes.
   */
  @Get()
  root() {
    return {
      service: 'helix-user-service',
      version: '1.0.0',
      status: 'running',
    };
  }

  /**
   * Hypertune-aware status endpoint.
   * Shows current feature gates or rollout logic in effect.
   */
  @Get('status')
  getStatus() {
    return this.appService.getStatus();
  }
}
