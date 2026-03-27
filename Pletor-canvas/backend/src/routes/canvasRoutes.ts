import type { FastifyInstance } from 'fastify'
import * as canvasCtrl from '../controllers/canvasController.js'

export async function canvasRoutes(app: FastifyInstance) {
  // Canvas CRUD
  app.get('/api/v1/canvas', canvasCtrl.listCanvases)
  app.post('/api/v1/canvas', canvasCtrl.createCanvas)
  app.get('/api/v1/canvas/:id', canvasCtrl.getCanvas)
  app.patch('/api/v1/canvas/:id', canvasCtrl.updateCanvas)
  app.delete('/api/v1/canvas/:id', canvasCtrl.deleteCanvas)

  // Nodes CRUD (pod canvasem)
  app.get('/api/v1/canvas/:canvasId/nodes', canvasCtrl.listNodes)
  app.post('/api/v1/canvas/:canvasId/nodes', canvasCtrl.createNode)
  app.patch('/api/v1/nodes/:id', canvasCtrl.updateNode)
  app.delete('/api/v1/nodes/:id', canvasCtrl.deleteNode)

  // Edges CRUD (pod canvasem)
  app.get('/api/v1/canvas/:canvasId/edges', canvasCtrl.listEdges)
  app.post('/api/v1/canvas/:canvasId/edges', canvasCtrl.createEdge)
  app.patch('/api/v1/edges/:id', canvasCtrl.updateEdge)
  app.delete('/api/v1/edges/:id', canvasCtrl.deleteEdge)

  // Batch save — uloží celý stav canvasu najednou
  app.put('/api/v1/canvas/:canvasId/batch', canvasCtrl.batchSave)
}
