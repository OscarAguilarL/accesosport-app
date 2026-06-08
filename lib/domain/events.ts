import type { EventSummaryResponse, EventResponse } from '../types'

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

export function getEventStats(event: EventResponse): EventStats {
  const totalRegistered = event.registeredCount ?? 0
  const totalCapacity   = event.maxCapacity ?? 0
  const totalAvailable  = event.availableSpots ?? 0
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
