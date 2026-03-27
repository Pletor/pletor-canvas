const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'UNKNOWN', message: 'Chyba serveru' }))
    throw new ApiError(response.status, error.error ?? 'UNKNOWN', error.message ?? 'Chyba serveru')
  }

  // 204 No Content
  if (response.status === 204) return undefined as T

  return response.json()
}

export { API_BASE }
