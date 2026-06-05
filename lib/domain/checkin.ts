import type { ParticipantInEventResponse } from '../types'

export interface CheckinStats {
  totalConfirmed: number
  kitsDelivered: number
  kitsPending: number
}

export function buildCheckinStats(registrations: ParticipantInEventResponse[]): CheckinStats {
  const confirmed = registrations.filter((p) => p.status === 'CONFIRMED')
  const kitsDelivered = confirmed.filter((p) => p.kitPickedUp).length
  return {
    totalConfirmed: confirmed.length,
    kitsDelivered,
    kitsPending: confirmed.length - kitsDelivered,
  }
}
