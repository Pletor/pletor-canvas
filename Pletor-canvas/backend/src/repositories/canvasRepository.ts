import { prisma } from '../config/database.js'
import type {
  CreateCanvasInput,
  UpdateCanvasInput,
  CreateNodeInput,
  UpdateNodeInput,
  CreateEdgeInput,
  UpdateEdgeInput,
} from '../validators/canvasValidator.js'

// === Canvas ===

export function findAllCanvases() {
  return prisma.canvas.findMany({
    include: { _count: { select: { nodes: true, edges: true } } },
    orderBy: { updatedAt: 'desc' },
  })
}

export function findCanvasById(id: string) {
  return prisma.canvas.findUnique({
    where: { id },
    include: { nodes: true, edges: true },
  })
}

export function createCanvas(data: CreateCanvasInput) {
  return prisma.canvas.create({ data })
}

export function updateCanvas(id: string, data: UpdateCanvasInput) {
  return prisma.canvas.update({ where: { id }, data })
}

export function deleteCanvas(id: string) {
  return prisma.canvas.delete({ where: { id } })
}

// === Nodes ===

export function findNodesByCanvasId(canvasId: string) {
  return prisma.canvasNode.findMany({ where: { canvasId } })
}

export function findNodeById(id: string) {
  return prisma.canvasNode.findUnique({ where: { id } })
}

export function createNode(canvasId: string, data: CreateNodeInput) {
  return prisma.canvasNode.create({
    data: { ...data, canvasId },
  })
}

export function updateNode(id: string, data: UpdateNodeInput) {
  return prisma.canvasNode.update({ where: { id }, data })
}

export function deleteNode(id: string) {
  return prisma.canvasNode.delete({ where: { id } })
}

// === Edges ===

export function findEdgesByCanvasId(canvasId: string) {
  return prisma.canvasEdge.findMany({ where: { canvasId } })
}

export function findEdgeById(id: string) {
  return prisma.canvasEdge.findUnique({ where: { id } })
}

export function createEdge(canvasId: string, data: CreateEdgeInput) {
  return prisma.canvasEdge.create({
    data: { ...data, canvasId },
  })
}

export function updateEdge(id: string, data: UpdateEdgeInput) {
  return prisma.canvasEdge.update({ where: { id }, data })
}

export function deleteEdge(id: string) {
  return prisma.canvasEdge.delete({ where: { id } })
}

// === Batch ===

export function deleteAllNodesAndEdges(canvasId: string) {
  return prisma.$transaction([
    prisma.canvasEdge.deleteMany({ where: { canvasId } }),
    prisma.canvasNode.deleteMany({ where: { canvasId } }),
  ])
}

export function batchCreateNodesAndEdges(
  canvasId: string,
  nodes: (CreateNodeInput & { id?: string })[],
  edges: (CreateEdgeInput & { id?: string })[],
) {
  return prisma.$transaction(async (tx) => {
    // Nejdřív smaž vše
    await tx.canvasEdge.deleteMany({ where: { canvasId } })
    await tx.canvasNode.deleteMany({ where: { canvasId } })

    // Vytvoř nové uzly
    const createdNodes = await Promise.all(
      nodes.map((node) =>
        tx.canvasNode.create({
          data: {
            id: node.id,
            canvasId,
            nodeType: node.nodeType,
            label: node.label,
            description: node.description,
            status: node.status,
            positionX: node.positionX,
            positionY: node.positionY,
          },
        }),
      ),
    )

    // Vytvoř nové hrany
    const createdEdges = await Promise.all(
      edges.map((edge) =>
        tx.canvasEdge.create({
          data: {
            id: edge.id,
            canvasId,
            edgeType: edge.edgeType,
            sourceId: edge.sourceId,
            targetId: edge.targetId,
            label: edge.label,
            animated: edge.animated,
          },
        }),
      ),
    )

    return { nodes: createdNodes, edges: createdEdges }
  })
}
