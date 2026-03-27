import { z } from 'zod'

export const executeAgentSchema = z.object({
  model: z.string().optional(),
})

export type ExecuteAgentInput = z.infer<typeof executeAgentSchema>
