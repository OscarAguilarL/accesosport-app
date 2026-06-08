'use client'

import { useEffect, useRef, useState } from 'react'
import { checkin as checkinApi } from '../api'
import { buildCheckinStats } from '../domain/checkin'
import type { ParticipantInEventResponse } from '../types'

export interface SessionEntry {
  bibNumber: number | null
  fullName: string | null
  deliveredAt: string
}

export type SearchError = 'not_found' | 'cancelled' | null

export interface UseCheckinResult {
  isValidating: boolean
  tokenValid: boolean
  eventName: string

  code: string
  setCode: (v: string) => void
  isSearching: boolean
  participant: ParticipantInEventResponse | null
  searchError: SearchError
  handleSearch: (overrideCode?: string) => Promise<void>
  inputRef: React.RefObject<HTMLInputElement | null>

  totalConfirmed: number
  kitsDelivered: number
  isLoadingStats: boolean

  isDelivering: boolean
  deliveryError: boolean
  handleDeliverKit: () => Promise<void>

  sessionHistory: SessionEntry[]

  showScanner: boolean
  setShowScanner: (v: boolean) => void
  cameraError: boolean
  setCameraError: (v: boolean) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scannerRef: React.RefObject<any>
  handleCloseScanner: () => void
}

export function useCheckin(eventId: string, token: string): UseCheckinResult {
  const inputRef = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null)

  const [isValidating, setIsValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [eventName, setEventName] = useState('')

  const [code, setCode] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isDelivering, setIsDelivering] = useState(false)
  const [participant, setParticipant] = useState<ParticipantInEventResponse | null>(null)
  const [searchError, setSearchError] = useState<SearchError>(null)

  const [totalConfirmed, setTotalConfirmed] = useState(0)
  const [kitsDelivered, setKitsDelivered] = useState(0)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const [sessionHistory, setSessionHistory] = useState<SessionEntry[]>([])
  const [showScanner, setShowScanner] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [deliveryError, setDeliveryError] = useState(false)

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setIsValidating(false)
        return
      }
      try {
        const result = await checkinApi.validateToken(eventId, token)
        setTokenValid(result.valid)
        setEventName(result.eventName ?? '')
      } catch {
        setTokenValid(false)
      } finally {
        setIsValidating(false)
      }
    }
    validate()
  }, [eventId, token])

  useEffect(() => {
    if (!tokenValid) return
    const fetchStats = async () => {
      try {
        const res = await checkinApi.getEventRegistrations(eventId, token)
        const { totalConfirmed: tc, kitsDelivered: kd } = buildCheckinStats(res.content)
        setTotalConfirmed(tc)
        setKitsDelivered(kd)
      } catch {
        // stats are best-effort
      } finally {
        setIsLoadingStats(false)
      }
    }
    fetchStats()
  }, [eventId, tokenValid, token])

  const handleSearch = async (overrideCode?: string) => {
    const searchCode = overrideCode ?? code
    if (!searchCode.trim()) return

    setIsSearching(true)
    setParticipant(null)
    setSearchError(null)

    try {
      const result = await checkinApi.findByCode(searchCode.trim(), token)
      if (result.status === 'CANCELLED') {
        setSearchError('cancelled')
      } else {
        setParticipant(result)
      }
    } catch {
      setSearchError('not_found')
    } finally {
      setIsSearching(false)
    }
  }

  const handleDeliverKit = async () => {
    if (!participant) return

    setIsDelivering(true)
    setDeliveryError(false)
    try {
      const updated = await checkinApi.markKitDelivered(participant.ticketCode, token)
      setParticipant(updated)
      setKitsDelivered((prev) => prev + 1)
      setSessionHistory((prev) => [
        {
          bibNumber: updated.bibNumber,
          fullName: updated.fullName,
          deliveredAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.slice(0, 4),
      ])

      await new Promise((resolve) => setTimeout(resolve, 1500))
      setParticipant(null)
      setCode('')
      inputRef.current?.focus()
    } catch {
      setDeliveryError(true)
    } finally {
      setIsDelivering(false)
    }
  }

  const handleCloseScanner = () => {
    scannerRef.current?.clear().catch(() => null)
    setShowScanner(false)
  }

  return {
    isValidating,
    tokenValid,
    eventName,
    code,
    setCode,
    isSearching,
    participant,
    searchError,
    handleSearch,
    inputRef,
    totalConfirmed,
    kitsDelivered,
    isLoadingStats,
    isDelivering,
    deliveryError,
    handleDeliverKit,
    sessionHistory,
    showScanner,
    setShowScanner,
    cameraError,
    setCameraError,
    scannerRef,
    handleCloseScanner,
  }
}
