import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} nebyl nalezen`)
  }
}

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.code,
      message: error.message,
      details: error.details,
    })
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'VALIDATION_ERROR',
      message: 'Neplatná vstupní data',
      details: error.errors.map((e) => ({
        field: e.path.join('.'),
        issue: e.message,
      })),
    })
  }

  // Neočekávaná chyba
  console.error('Neočekávaná chyba:', error)
  return reply.status(500).send({
    error: 'INTERNAL_ERROR',
    message: 'Interní chyba serveru',
  })
}
