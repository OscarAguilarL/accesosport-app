import { fetchApi } from './client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types'

export const auth = {
  login: (data: LoginRequest) =>
    fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  signup: (data: RegisterRequest) =>
    fetchApi<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  forgotPassword: (email: string) =>
    fetchApi<void>('/api/v1/public/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    fetchApi<void>('/api/v1/public/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
}
