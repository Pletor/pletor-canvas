import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().default('file:./dev.db'),
  PORT: z.coerce.number().default(8080),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  ANTHROPIC_API_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env)
