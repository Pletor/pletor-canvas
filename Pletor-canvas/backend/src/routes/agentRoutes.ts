import type { FastifyInstance } from 'fastify'
import * as agentCtrl from '../controllers/agentController.js'

export async function agentRoutes(app: FastifyInstance) {
  // Kontext uzlu pro agenta (preview)
  app.get('/api/v1/agents/:nodeId/context', agentCtrl.getContext)

  // Spuštění agenta
  app.post('/api/v1/agents/:nodeId/execute', agentCtrl.execute)

  // Spuštění agenta — streaming
  app.post('/api/v1/agents/:nodeId/stream', agentCtrl.executeStream)

  // Historie spuštění
  app.get('/api/v1/agents/:nodeId/executions', agentCtrl.listExecutions)

  // Detail spuštění
  app.get('/api/v1/agents/executions/:id', agentCtrl.getExecution)
}
