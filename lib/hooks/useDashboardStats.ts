'use client'

import { useEffect, useState } from 'react'
import { events as eventsApi } from '../api'
import type { EventSummaryResponse } from '../types'

export interface DashboardStats {
  totalEvents: number
  activeEvents: number
  totalSpots: number
  upcomingEvents: number
}

export interface UseDashboardStatsResult {
  myEvents: EventSummaryResponse[]
  stats: DashboardStats
  recentEvents: EventSummaryResponse[]
  isLoading: boolean
  error: string | null
}

function computeStats(evts: EventSummaryResponse[]): DashboardStats {
  return {
    totalEvents: evts.length,
    activeEvents: evts.filter(
      (e) => e.status === 'REGISTRATION_OPEN' || e.status === 'PUBLISHED'
    ).length,
    totalSpots: evts.reduce((acc, e) => acc + (e.totalAvailableSpots || 0), 0),
    upcomingEvents: evts.filter(
      (e) => e.eventDate && new Date(e.eventDate) > new Date()
    ).length,
  }
}

export function useDashboardStats(): UseDashboardStatsResult {
  const [myEvents, setMyEvents] = useState<EventSummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    eventsApi
      .listMyEvents()
      .then(setMyEvents)
      .catch((e: unknown) => {
        console.error('[useDashboardStats]', e)
        setError((e as Error)?.message ?? 'Error al cargar los eventos')
      })
      .finally(() => setIsLoading(false))
  }, [])

  return {
    myEvents,
    stats: computeStats(myEvents),
    recentEvents: myEvents.slice(0, 5),
    isLoading,
    error,
  }
}
