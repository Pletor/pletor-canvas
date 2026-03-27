import type { FastifyRequest, FastifyReply } from 'fastify'
import * as canvasService from '../services/canvasService.js'
import {
  createCanvasSchema,
  updateCanvasSchema,
  createNodeSchema,
  updateNodeSchema,
  createEdgeSchema,
  updateEdgeSchema,
  batchSaveSchema,
} from '../validators/canvasValidator.js'

type IdParam = { id: string }
type CanvasIdParam = { canvasId: string }

// === Canvas ===

export async function listCanvases(_req: FastifyRequest, reply: FastifyReply) {
  const canvases = await canvasService.getAllCanvases()
  return reply.send(canvases)
}

export async function getCanvas(req: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) {
  const canvas = await canvasService.getCanvasById(req.params.id)
  return reply.send(canvas)
}

export async function createCanvas(req: FastifyRequest, reply: FastifyReply) {
  const data = createCanvasSchema.parse(req.body)
  const canvas = await canvasService.createCanvas(data)
  return reply.status(201).send(canvas)
}

export async function updateCanvas(req: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) {
  const data = updateCanvasSchema.parse(req.body)
  const canvas = await canvasService.updateCanvas(req.params.id, data)
  return reply.send(canvas)
}

export async function deleteCanvas(req: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) {
  await canvasService.deleteCanvas(req.params.id)
  return reply.status(204).send()
}

// === Nodes ===

export async function listNodes(req: FastifyRequest<{ Params: CanvasIdParam }>, reply: FastifyReply) {
  const nodes = await canvasService.getNodesByCanvasId(req.params.canvasId)
  return reply.send(nodes)
}

export async function createNode(req: FastifyRequest<{ Params: CanvasIdParam }>, reply: FastifyReply) {
  const data = createNodeSchema.parse(req.body)
  const node = await canvasService.createNode(req.params.canvasId, data)
  return reply.status(201).send(node)
}

export async function updateNode(req: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) {
  const data = updateNodeSchema.parse(req.body)
  const node = await canvasService.updateNode(req.params.id, data)
  return reply.send(node)
}

export async function deleteNode(req: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) {
  await canvasService.deleteNode(req.params.id)
  return reply.status(204).send()
}

// === Edges ===

export async function listEdges(req: FastifyRequest<{ Params: CanvasIdParam }>, reply: FastifyReply) {
  const edges = await canvasService.getEdgesByCanvasId(req.params.canvasId)
  return reply.send(edges)
}

export async function createEdge(req: FastifyRequest<{ Params: CanvasIdParam }>, reply: FastifyReply) {
  const data = createEdgeSchema.parse(req.body)
  const edge = await canvasService.createEdge(req.params.canvasId, data)
  return reply.status(201).send(edge)
}

export async function updateEdge(req: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) {
  const data = updateEdgeSchema.parse(req.body)
  const edge = await canvasService.updateEdge(req.params.id, data)
  return reply.send(edge)
}

export async function deleteEdge(req: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) {
  await canvasService.deleteEdge(req.params.id)
  return reply.status(204).send()
}

// === Batch ===

export async function batchSave(req: FastifyRequest<{ Params: CanvasIdParam }>, reply: FastifyReply) {
  const data = batchSaveSchema.parse(req.body)
  const result = await canvasService.batchSave(req.params.canvasId, data)
  return reply.send(result)
}
