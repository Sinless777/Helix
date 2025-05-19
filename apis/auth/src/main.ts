import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { VersioningType } from '@nestjs/common'

/**
 * Bootstraps the NestJS application with Fastify, versioning, and CORS support.
 */
async function bootstrap(): Promise<void> {
  // Create a Fastify-based Nest application instance
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )

  /**
   * Enable URI-based API versioning.
   * Routes will be prefixed with `/api/v1`.
   */
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v1',
  })

  /**
   * Enable CORS for all origins.
   * For production, consider restricting allowed origins.
   */
  app.enableCors()

  /**
   * Start listening on the configured port (default: 3000)
   */
  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.log(`🚀 Server is running at http://localhost:${port}/api/v1`)
}

bootstrap()
