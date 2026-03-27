import { z } from 'zod'

const nodeTypeEnum = z.enum(['folder', 'file', 'component', 'service', 'api', 'agent', 'integration'])
const edgeTypeEnum = z.enum(['import', 'apiCall', 'dataFlow', 'event'])
const nodeStatusEnum = z.enum(['active', 'draft', 'archived'])

// Canvas
export const createCanvasSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export const updateCanvasSchema = createCanvasSchema.partial()

// Node
export const createNodeSchema = z.object({
  nodeType: nodeTypeEnum,
  label: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  status: nodeStatusEnum.default('active'),
  positionX: z.number(),
  positionY: z.number(),
})

export const updateNodeSchema = z.object({
  label: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: nodeStatusEnum.optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  nodeType: nodeTypeEnum.optional(),
})

// Edge
export const createEdgeSchema = z.object({
  edgeType: edgeTypeEnum,
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  label: z.string().max(200).optional(),
  animated: z.boolean().default(false),
})

export const updateEdgeSchema = z.object({
  edgeType: edgeTypeEnum.optional(),
  label: z.string().max(200).optional(),
  animated: z.boolean().optional(),
})

// Batch operace — uložení celého canvasu najednou
export const batchSaveSchema = z.object({
  nodes: z.array(z.object({
    id: z.string().optional(),
    nodeType: nodeTypeEnum,
    label: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    status: nodeStatusEnum.default('active'),
    positionX: z.number(),
    positionY: z.number(),
  })),
  edges: z.array(z.object({
    id: z.string().optional(),
    edgeType: edgeTypeEnum,
    sourceId: z.string().min(1),
    targetId: z.string().min(1),
    label: z.string().max(200).optional(),
    animated: z.boolean().default(false),
  })),
})

// Typy odvozené ze schémat
export type CreateCanvasInput = z.infer<typeof createCanvasSchema>
export type UpdateCanvasInput = z.infer<typeof updateCanvasSchema>
export type CreateNodeInput = z.infer<typeof createNodeSchema>
export type UpdateNodeInput = z.infer<typeof updateNodeSchema>
export type CreateEdgeInput = z.infer<typeof createEdgeSchema>
export type UpdateEdgeInput = z.infer<typeof updateEdgeSchema>
export type BatchSaveInput = z.infer<typeof batchSaveSchema>
