import type { FastifyRequest, FastifyReply } from 'fastify'
import * as wfSync from '../services/workflowySyncService.js'
import {
  configureWorkflowySchema,
  linkNodeSchema,
  unlinkNodeSchema,
} from '../validators/workflowyValidator.js'

type CanvasIdParam = { canvasId: string }
type NodeIdParam = { nodeId: string }

// Nastav WorkFlowy API klíč
export async function configure(req: FastifyRequest, reply: FastifyReply) {
  const { apiKey } = configureWorkflowySchema.parse(req.body)
  wfSync.configureWorkFlowy(apiKey)
  return reply.send({ status: 'ok', message: 'WorkFlowy připojen' })
}

// Stav připojení
export async function status(_req: FastifyRequest, reply: FastifyReply) {
  return reply.send({ configured: wfSync.isWorkFlowyConfigured() })
}

// Celý WorkFlowy strom (parsovaný)
export async function getTree(_req: FastifyRequest, reply: FastifyReply) {
  const tree = await wfSync.getWorkFlowyTree()
  return reply.send(tree)
}

// Konkrétní WorkFlowy uzel
export async function getNode(req: FastifyRequest<{ Params: NodeIdParam }>, reply: FastifyReply) {
  const node = await wfSync.getWorkFlowyNode(req.params.nodeId)
  if (!node) return reply.status(404).send({ error: 'NOT_FOUND', message: 'WorkFlowy uzel nenalezen' })
  return reply.send(node)
}

// Synchronizace WorkFlowy → Canvas
export async function sync(req: FastifyRequest<{ Params: CanvasIdParam }>, reply: FastifyReply) {
  const result = await wfSync.syncWorkFlowyToCanvas(req.params.canvasId)
  return reply.send(result)
}

// Propojit canvas uzel s WorkFlowy uzlem
export async function linkNode(req: FastifyRequest, reply: FastifyReply) {
  const { canvasNodeId, workflowyNodeId } = linkNodeSchema.parse(req.body)
  const node = await wfSync.linkNodeToWorkFlowy(canvasNodeId, workflowyNodeId)
  return reply.send(node)
}

// Odpojit canvas uzel od WorkFlowy
export async function unlinkNode(req: FastifyRequest, reply: FastifyReply) {
  const { canvasNodeId } = unlinkNodeSchema.parse(req.body)
  const node = await wfSync.unlinkNodeFromWorkFlowy(canvasNodeId)
  return reply.send(node)
}
