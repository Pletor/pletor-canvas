import type { FastifyInstance, FastifyReply } from 'fastify'

// Všechny budoucí endpointy registrovány jako 501 Not Implemented
// Podle principu: registrace → implementace → rozšíření

function notImplemented(_req: unknown, reply: FastifyReply) {
  return reply.status(501).send({
    error: 'NOT_IMPLEMENTED',
    message: 'Tento endpoint bude dostupný v budoucí verzi',
  })
}

export async function futureRoutes(app: FastifyInstance) {
  // Fáze 2 — WorkFlowy sync
  app.get('/api/v1/workflowy/sync', notImplemented)
  app.post('/api/v1/workflowy/sync', notImplemented)
  app.get('/api/v1/workflowy/nodes', notImplemented)

  // Fáze 3 — AI Agent pipeline
  app.get('/api/v1/agents', notImplemented)
  app.post('/api/v1/agents/:id/execute', notImplemented)
  app.get('/api/v1/agents/:id/context', notImplemented)

  // Fáze 4 — File system integrace
  app.get('/api/v1/filesystem/tree', notImplemented)
  app.get('/api/v1/filesystem/file', notImplemented)

  // Tickety, Logy, Paměť, Pravidla
  app.get('/api/v1/tickets', notImplemented)
  app.get('/api/v1/logs', notImplemented)
  app.get('/api/v1/memory', notImplemented)
  app.get('/api/v1/rules', notImplemented)
}
