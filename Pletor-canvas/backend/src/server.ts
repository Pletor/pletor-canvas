import Fastify from 'fastify'
import cors from '@fastify/cors'
import { env } from './config/env.js'
import { prisma } from './config/database.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { canvasRoutes } from './routes/canvasRoutes.js'
import { workflowyRoutes } from './routes/workflowyRoutes.js'
import { agentRoutes } from './routes/agentRoutes.js'
import { futureRoutes } from './routes/futureRoutes.js'

async function bootstrap() {
  const app = Fastify({ logger: true })

  // CORS
  await app.register(cors, { origin: env.CORS_ORIGIN })

  // Globální error handler
  app.setErrorHandler(errorHandler)

  // Health check
  app.get('/api/v1/health', async () => ({
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  }))

  // Registrace routes
  await app.register(canvasRoutes)
  await app.register(workflowyRoutes)
  await app.register(agentRoutes)
  await app.register(futureRoutes)

  // Graceful shutdown
  const shutdown = async () => {
    await app.close()
    await prisma.$disconnect()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  // Start
  await app.listen({ port: env.PORT, host: env.HOST })
  console.log(`Pletor API běží na http://${env.HOST}:${env.PORT}`)
}

bootstrap()
