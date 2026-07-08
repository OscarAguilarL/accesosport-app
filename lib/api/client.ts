export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'

export class ApiError extends Error {
  status: number
  detail?: string

  constructor(message: string, status: number, detail?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const isAuthEndpoint = endpoint.startsWith('/auth/')
  if (response.status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
    localStorage.removeItem('accessToken')
    const currentPath = window.location.pathname
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
    throw new ApiError('Session expired', 401)
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.title || 'An error occurred',
      response.status,
      errorData.detail
    )
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T
  }

  return response.json()
}
