import { fetchApi } from './client'
import type { InvitationValidationResponse, InvitationResponse, CreateInvitationRequest } from '../types'

export const invitations = {
  validate: (token: string) =>
    fetchApi<InvitationValidationResponse>(`/api/v1/public/invitations/${token}`),

  create: (data: CreateInvitationRequest) =>
    fetchApi<InvitationResponse>('/api/v1/admin/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: () =>
    fetchApi<InvitationResponse[]>('/api/v1/admin/invitations'),

  revoke: (token: string) =>
    fetchApi<void>(`/api/v1/admin/invitations/${token}`, {
      method: 'DELETE',
    }),
}
