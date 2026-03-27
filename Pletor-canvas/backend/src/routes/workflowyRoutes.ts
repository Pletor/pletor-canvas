import type { FastifyInstance } from 'fastify'
import * as wfCtrl from '../controllers/workflowyController.js'

export async function workflowyRoutes(app: FastifyInstance) {
  // Konfigurace — nastavení session tokenu
  app.post('/api/v1/workflowy/configure', wfCtrl.configure)
  app.get('/api/v1/workflowy/status', wfCtrl.status)

  // Čtení WorkFlowy stromu
  app.get('/api/v1/workflowy/tree', wfCtrl.getTree)
  app.get('/api/v1/workflowy/nodes/:nodeId', wfCtrl.getNode)

  // Synchronizace
  app.post('/api/v1/workflowy/sync/:canvasId', wfCtrl.sync)

  // Propojení canvas ↔ WorkFlowy
  app.post('/api/v1/workflowy/link', wfCtrl.linkNode)
  app.post('/api/v1/workflowy/unlink', wfCtrl.unlinkNode)
}
