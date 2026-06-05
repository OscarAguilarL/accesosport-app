import { fetchApi, ApiError, API_BASE_URL } from './client'
import type {
  UserInformationDto,
  SavePersonalDataRequest,
  SaveUserAddressRequest,
  OrganizerProfileResponse,
  OrganizerProfileWithTokenResponse,
  CreateOrganizerProfileRequest,
  ParticipantProfileResponse,
  ParticipantProfileWithTokenResponse,
  CreateParticipantProfileRequest,
} from '../types'

export const user = {
  getMe: () =>
    fetchApi<UserInformationDto>('/api/v1/user/me'),

  savePersonalData: (data: SavePersonalDataRequest) =>
    fetchApi<void>('/api/v1/user/personal-information', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  saveAddress: (data: SaveUserAddressRequest) =>
    fetchApi<void>('/api/v1/user/address', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

export const profile = {
  getOrganizer: () =>
    fetchApi<OrganizerProfileResponse>('/api/v1/user/profile/organizer'),

  createOrganizer: (data: CreateOrganizerProfileRequest) =>
    fetchApi<OrganizerProfileWithTokenResponse>('/api/v1/user/profile/organizer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  uploadOrganizerLogo: async (file: File) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`${API_BASE_URL}/api/v1/user/profile/organizer/logo`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    if (!response.ok) throw new ApiError('Failed to upload logo', response.status)
    return response.json() as Promise<OrganizerProfileResponse>
  },

  getParticipant: () =>
    fetchApi<ParticipantProfileResponse>('/api/v1/user/profile/participant'),

  createParticipant: (data: CreateParticipantProfileRequest) =>
    fetchApi<ParticipantProfileWithTokenResponse>('/api/v1/user/profile/participant', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateParticipant: (data: CreateParticipantProfileRequest) =>
    fetchApi<ParticipantProfileResponse>('/api/v1/user/profile/participant', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}
