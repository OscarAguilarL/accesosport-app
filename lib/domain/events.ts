import type { EventSummaryResponse, EventModalityResponse, EventResponse } from '../types'

export function isSoldOut(event: Pick<EventSummaryResponse, 'totalAvailableSpots'>): boolean {
  return event.totalAvailableSpots === 0
}

export function isLastSpots(event: Pick<EventSummaryResponse, 'totalAvailableSpots'>): boolean {
  return (
    event.totalAvailableSpots !== undefined &&
    event.totalAvailableSpots > 0 &&
    event.totalAvailableSpots <= 15
  )
}

export interface EventStats {
  totalRegistered: number
  totalCapacity: number
  totalAvailable: number
  occupancyPercent: number
}

export function getEventStats(modalities: EventModalityResponse[]): EventStats {
  const totalRegistered = modalities.reduce((s, m) => s + m.registeredCount, 0)
  const totalCapacity   = modalities.reduce((s, m) => s + m.capacity, 0)
  const totalAvailable  = modalities.reduce((s, m) => s + m.availableSpots, 0)
  const occupancyPercent = totalCapacity > 0
    ? Math.round((totalRegistered / totalCapacity) * 100)
    : 0
  return { totalRegistered, totalCapacity, totalAvailable, occupancyPercent }
}

export function canPublish(event: Pick<EventResponse, 'status'>): boolean {
  return event.status === 'DRAFT'
}

export function canOpenRegistration(event: Pick<EventResponse, 'status'>): boolean {
  return event.status === 'PUBLISHED'
}

export function canCancel(event: Pick<EventResponse, 'status'>): boolean {
  return event.status !== 'COMPLETED' && event.status !== 'CANCELLED'
}
