import { fetchApi, ApiError, API_BASE_URL } from './client'
import type {
  EventSummaryResponse,
  EventResponse,
  CreateEventRequest,
  UpdateEventRequest,
  EventModalityResponse,
  CreateModalityRequest,
  EventCategoryResponse,
  CreateCategoryRequest,
  PagedResponse,
} from '../types'

export const events = {
  list: (status?: EventSummaryResponse['status'], page = 0, size = 20) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (status) params.set('eventStatus', status)
    return fetchApi<PagedResponse<EventSummaryResponse>>(`/api/v1/events?${params}`)
  },

  listMyEvents: (page = 0, size = 20) =>
    fetchApi<PagedResponse<EventSummaryResponse>>(`/api/v1/events/my-events?page=${page}&size=${size}`),

  listAvailable: (page = 0, size = 20) =>
    fetchApi<PagedResponse<EventSummaryResponse>>(`/api/v1/public/events/available?page=${page}&size=${size}`),

  listPublished: (page = 0, size = 20) =>
    fetchApi<PagedResponse<EventSummaryResponse>>(`/api/v1/public/events/published?page=${page}&size=${size}`),

  get: (eventId: string) =>
    fetchApi<EventResponse>(`/api/v1/public/events/${eventId}`),

  create: (data: CreateEventRequest) =>
    fetchApi<EventResponse>('/api/v1/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (eventId: string, data: UpdateEventRequest) =>
    fetchApi<EventResponse>(`/api/v1/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  publish: (eventId: string) =>
    fetchApi<EventResponse>(`/api/v1/events/${eventId}/publish`, {
      method: 'PUT',
    }),

  openRegistration: (eventId: string) =>
    fetchApi<EventResponse>(`/api/v1/events/${eventId}/open-registration`, {
      method: 'PUT',
    }),

  complete: (eventId: string) =>
    fetchApi<EventResponse>(`/api/v1/events/${eventId}/complete`, {
      method: 'PUT',
    }),

  cancel: (eventId: string, reason?: string) =>
    fetchApi<EventResponse>(`/api/v1/events/${eventId}/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`, {
      method: 'DELETE',
    }),

  uploadCoverImage: async (eventId: string, file: File) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`${API_BASE_URL}/api/v1/events/${eventId}/cover-image`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    if (!response.ok) throw new ApiError('Failed to upload image', response.status)
    return response.json() as Promise<EventResponse>
  },

  getGallery: (eventId: string) =>
    fetchApi<{ id: string; imageUrl: string; displayOrder: number }[]>(`/api/v1/public/events/${eventId}/images`),

  addGalleryImage: async (eventId: string, file: File) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`${API_BASE_URL}/api/v1/events/${eventId}/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    if (!response.ok) throw new ApiError('Failed to upload image', response.status)
    return response.json()
  },

  removeGalleryImage: (eventId: string, imageId: string) =>
    fetchApi<void>(`/api/v1/events/${eventId}/images/${imageId}`, {
      method: 'DELETE',
    }),
}

export const categories = {
  list: (eventId: string) =>
    fetchApi<EventCategoryResponse[]>(`/api/v1/public/events/${eventId}/categories`),

  create: (eventId: string, data: CreateCategoryRequest) =>
    fetchApi<EventCategoryResponse>(`/api/v1/events/${eventId}/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (eventId: string, categoryId: string) =>
    fetchApi<void>(`/api/v1/events/${eventId}/categories/${categoryId}`, {
      method: 'DELETE',
    }),
}

export const modalities = {
  list: (eventId: string) =>
    fetchApi<EventModalityResponse[]>(`/api/v1/public/events/${eventId}/modalities`),

  create: (eventId: string, data: CreateModalityRequest) =>
    fetchApi<EventModalityResponse>(`/api/v1/events/${eventId}/modalities`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (eventId: string, modalityId: string) =>
    fetchApi<void>(`/api/v1/events/${eventId}/modalities/${modalityId}`, {
      method: 'DELETE',
    }),
}
