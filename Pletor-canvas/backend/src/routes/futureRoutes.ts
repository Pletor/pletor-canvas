import type { FastifyInstance, FastifyReply } from 'fastify'

// Budoucí endpointy registrovány jako 501 Not Implemented
// Podle principu: registrace → implementace → rozšíření
// WorkFlowy routes přesunuty do workflowyRoutes.ts (Fáze 2 — implementováno)

function notImplemented(_req: unknown, reply: FastifyReply) {
  return reply.status(501).send({
    error: 'NOT_IMPLEMENTED',
    message: 'Tento endpoint bude dostupný v budoucí verzi',
  })
}

export async function futureRoutes(app: FastifyInstance) {
  // Fáze 4 — File system integrace
  app.get('/api/v1/filesystem/tree', notImplemented)
  app.get('/api/v1/filesystem/file', notImplemented)

  // Tickety, Logy, Paměť, Pravidla
  app.get('/api/v1/tickets', notImplemented)
  app.get('/api/v1/logs', notImplemented)
  app.get('/api/v1/memory', notImplemented)
  app.get('/api/v1/rules', notImplemented)
}
