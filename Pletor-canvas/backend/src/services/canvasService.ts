import * as canvasRepo from '../repositories/canvasRepository.js'
import { NotFoundError } from '../middlewares/errorHandler.js'
import type {
  CreateCanvasInput,
  UpdateCanvasInput,
  CreateNodeInput,
  UpdateNodeInput,
  CreateEdgeInput,
  UpdateEdgeInput,
  BatchSaveInput,
} from '../validators/canvasValidator.js'

// === Canvas ===

export function getAllCanvases() {
  return canvasRepo.findAllCanvases()
}

export async function getCanvasById(id: string) {
  const canvas = await canvasRepo.findCanvasById(id)
  if (!canvas) throw new NotFoundError('Canvas')
  return canvas
}

export function createCanvas(data: CreateCanvasInput) {
  return canvasRepo.createCanvas(data)
}

export async function updateCanvas(id: string, data: UpdateCanvasInput) {
  await ensureCanvasExists(id)
  return canvasRepo.updateCanvas(id, data)
}

export async function deleteCanvas(id: string) {
  await ensureCanvasExists(id)
  return canvasRepo.deleteCanvas(id)
}

// === Nodes ===

export async function getNodesByCanvasId(canvasId: string) {
  await ensureCanvasExists(canvasId)
  return canvasRepo.findNodesByCanvasId(canvasId)
}

export async function createNode(canvasId: string, data: CreateNodeInput) {
  await ensureCanvasExists(canvasId)
  return canvasRepo.createNode(canvasId, data)
}

export async function updateNode(id: string, data: UpdateNodeInput) {
  const node = await canvasRepo.findNodeById(id)
  if (!node) throw new NotFoundError('Uzel')
  return canvasRepo.updateNode(id, data)
}

export async function deleteNode(id: string) {
  const node = await canvasRepo.findNodeById(id)
  if (!node) throw new NotFoundError('Uzel')
  return canvasRepo.deleteNode(id)
}

// === Edges ===

export async function getEdgesByCanvasId(canvasId: string) {
  await ensureCanvasExists(canvasId)
  return canvasRepo.findEdgesByCanvasId(canvasId)
}

export async function createEdge(canvasId: string, data: CreateEdgeInput) {
  await ensureCanvasExists(canvasId)
  return canvasRepo.createEdge(canvasId, data)
}

export async function updateEdge(id: string, data: UpdateEdgeInput) {
  const edge = await canvasRepo.findEdgeById(id)
  if (!edge) throw new NotFoundError('Hrana')
  return canvasRepo.updateEdge(id, data)
}

export async function deleteEdge(id: string) {
  const edge = await canvasRepo.findEdgeById(id)
  if (!edge) throw new NotFoundError('Hrana')
  return canvasRepo.deleteEdge(id)
}

// === Batch ===

export async function batchSave(canvasId: string, data: BatchSaveInput) {
  await ensureCanvasExists(canvasId)
  return canvasRepo.batchCreateNodesAndEdges(canvasId, data.nodes, data.edges)
}

// === Helpers ===

async function ensureCanvasExists(id: string) {
  const canvas = await canvasRepo.findCanvasById(id)
  if (!canvas) throw new NotFoundError('Canvas')
}
