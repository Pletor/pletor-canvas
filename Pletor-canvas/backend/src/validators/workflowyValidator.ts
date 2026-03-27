import { z } from 'zod'

export const configureWorkflowySchema = z.object({
  apiKey: z.string().min(1, 'API klíč je povinný'),
})

export const linkNodeSchema = z.object({
  canvasNodeId: z.string().min(1),
  workflowyNodeId: z.string().min(1),
})

export const unlinkNodeSchema = z.object({
  canvasNodeId: z.string().min(1),
})

export type ConfigureWorkflowyInput = z.infer<typeof configureWorkflowySchema>
export type LinkNodeInput = z.infer<typeof linkNodeSchema>
export type UnlinkNodeInput = z.infer<typeof unlinkNodeSchema>
