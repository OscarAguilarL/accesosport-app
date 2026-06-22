import { fetchApi } from './client'
import type { AdminOrganizerListItem } from '../types'

export const admin = {
  listOrganizers: (): Promise<AdminOrganizerListItem[]> =>
    fetchApi('/api/v1/admin/organizers'),

  approveOrganizer: (id: string): Promise<AdminOrganizerListItem> =>
    fetchApi(`/api/v1/admin/organizers/${id}/approve`, { method: 'POST' }),

  rejectOrganizer: (id: string): Promise<AdminOrganizerListItem> =>
    fetchApi(`/api/v1/admin/organizers/${id}/reject`, { method: 'POST' }),

  submitOrganizerForReview: (id: string): Promise<AdminOrganizerListItem> =>
    fetchApi(`/api/v1/admin/organizers/${id}/submit-review`, { method: 'POST' }),
}
