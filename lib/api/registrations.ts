import { fetchApi, ApiError, API_BASE_URL } from './client'
import type {
  ParticipantInEventResponse,
  RegistrationResponse,
  CheckinTokenResponse,
  CheckinTokenValidationResponse,
} from '../types'

export const registrations = {
  getByEvent: (eventId: string) =>
    fetchApi<ParticipantInEventResponse[]>(`/api/v1/events/${eventId}/registrations`),

  register: (eventId: string, modalityId?: string, categoryId?: string, waiverAccepted?: boolean, wantsShirt?: boolean) =>
    fetchApi<RegistrationResponse>(`/api/v1/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ modalityId, categoryId: categoryId ?? null, waiverAccepted: waiverAccepted ?? false, wantsShirt: wantsShirt ?? true }),
    }),

  cancel: (eventId: string, registrationId: string) =>
    fetchApi<void>(`/api/v1/events/${eventId}/registrations/${registrationId}`, {
      method: 'DELETE',
    }),

  getMyRegistrations: () =>
    fetchApi<RegistrationResponse[]>('/api/v1/user/registrations'),

  resendTicket: (registrationId: string) =>
    fetchApi<void>(`/api/v1/user/registrations/${registrationId}/resend-ticket`, {
      method: 'POST',
    }),

  downloadTicket: async (registrationId: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const response = await fetch(
      `${API_BASE_URL}/api/v1/user/registrations/${registrationId}/ticket`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    )
    if (!response.ok) throw new ApiError('Error al descargar el boleto', response.status)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `boleto-${registrationId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  },
}

export const checkin = {
  findByCode: (ticketCode: string, token?: string) =>
    fetchApi<ParticipantInEventResponse>(
      `/api/v1/registrations/${ticketCode}${token ? `?token=${token}` : ''}`
    ),

  markKitDelivered: (ticketCode: string, token?: string) =>
    fetchApi<ParticipantInEventResponse>(
      `/api/v1/registrations/${ticketCode}/kit-pickup${token ? `?token=${token}` : ''}`,
      { method: 'PUT' }
    ),

  getEventRegistrations: (eventId: string, token?: string) =>
    fetchApi<ParticipantInEventResponse[]>(
      `/api/v1/events/${eventId}/registrations${token ? `?token=${token}` : ''}`
    ),

  generateToken: (eventId: string) =>
    fetchApi<CheckinTokenResponse>(`/api/v1/events/${eventId}/checkin-token`, {
      method: 'POST',
    }),

  validateToken: (eventId: string, token: string) =>
    fetchApi<CheckinTokenValidationResponse>(
      `/api/v1/public/checkin/validate?eventId=${eventId}&token=${token}`
    ),
}
