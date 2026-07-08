'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import {
  events as eventsApi,
  registrations as registrationsApi,
  modalities as modalitiesApi,
  checkin as checkinApi,
  ApiError,
} from '../api'
import { getEventStats } from '../domain/events'
import type { EventStats } from '../domain/events'
import type {
  EventResponse,
  ParticipantInEventResponse,
  EventModalityResponse,
  CreateModalityRequest,
  CheckinTokenResponse,
} from '../types'

const PARTICIPANTS_STATUSES = new Set(['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED'])

export interface UseEventDetailResult {
  event: EventResponse | null
  participants: ParticipantInEventResponse[]
  participantPage: number
  participantTotalPages: number
  participantTotalElements: number
  setParticipantPage: (page: number) => void
  eventModalities: EventModalityResponse[]
  stats: EventStats

  isLoading: boolean
  isActionLoading: boolean
  isLoadingParticipants: boolean

  showModalityForm: boolean
  setShowModalityForm: (v: boolean) => void
  modalityForm: CreateModalityRequest
  setModalityForm: (v: CreateModalityRequest) => void
  isSavingModality: boolean
  modalityError: string | null
  handleAddModality: (e: React.FormEvent) => Promise<void>
  handleDeleteModality: (modalityId: string) => Promise<void>

  handlePublish: () => Promise<void>
  handleOpenRegistration: () => Promise<void>
  handleComplete: () => Promise<void>
  handleCancel: () => Promise<void>

  exportToCSV: () => void

  showQrModal: boolean
  setShowQrModal: (v: boolean) => void
  qrTokenData: CheckinTokenResponse | null
  isGeneratingQr: boolean
  copied: boolean
  qrCanvasRef: React.RefObject<HTMLCanvasElement | null>
  handleGenerateQr: () => Promise<void>
  handleCopyLink: () => Promise<void>
  checkinUrl: (token: string) => string
}

export function useEventDetail(eventId: string): UseEventDetailResult {
  const router = useRouter()
  const { toast } = useToast()

  const [event, setEvent] = useState<EventResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [participants, setParticipants] = useState<ParticipantInEventResponse[]>([])
  const [participantPage, setParticipantPage] = useState(0)
  const [participantTotalPages, setParticipantTotalPages] = useState(0)
  const [participantTotalElements, setParticipantTotalElements] = useState(0)
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false)
  const [eventModalities, setEventModalities] = useState<EventModalityResponse[]>([])
  const [showModalityForm, setShowModalityForm] = useState(false)
  const [modalityForm, setModalityForm] = useState<CreateModalityRequest>({
    name: '', distance: 0, distanceUnit: 'KM', price: 0, priceWithoutShirt: null,
  })
  const [isSavingModality, setIsSavingModality] = useState(false)
  const [modalityError, setModalityError] = useState<string | null>(null)

  const [showQrModal, setShowQrModal] = useState(false)
  const [qrTokenData, setQrTokenData] = useState<CheckinTokenResponse | null>(null)
  const [isGeneratingQr, setIsGeneratingQr] = useState(false)
  const [copied, setCopied] = useState(false)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  const [eventStatus, setEventStatus] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const [data, mods] = await Promise.all([
          eventsApi.get(eventId),
          modalitiesApi.list(eventId).catch(() => [] as EventModalityResponse[]),
        ])
        setEvent(data)
        setEventModalities(mods)
        setEventStatus(data.status ?? null)
      } catch (error) {
        console.log('[useEventDetail] Error fetching event:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvent()
  }, [eventId])

  useEffect(() => {
    if (!eventStatus || !PARTICIPANTS_STATUSES.has(eventStatus)) return
    setIsLoadingParticipants(true)
    registrationsApi.getByEvent(eventId, participantPage)
      .then((res) => {
        setParticipants(res.content)
        setParticipantTotalPages(res.totalPages)
        setParticipantTotalElements(res.totalElements)
      })
      .catch((error) => console.log('[useEventDetail] Error fetching participants:', error))
      .finally(() => setIsLoadingParticipants(false))
  }, [eventId, eventStatus, participantPage])

  const handleAddModality = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingModality(true)
    setModalityError(null)
    try {
      const created = await modalitiesApi.create(eventId, modalityForm)
      setEventModalities((prev) => [...prev, created])
      setModalityForm({ name: '', distance: 0, distanceUnit: 'KM', price: 0, priceWithoutShirt: null })
      setShowModalityForm(false)
    } catch (err) {
      setModalityError(err instanceof ApiError ? (err.detail || err.message) : 'Error al crear la modalidad.')
    } finally {
      setIsSavingModality(false)
    }
  }

  const handleDeleteModality = async (modalityId: string) => {
    try {
      await modalitiesApi.delete(eventId, modalityId)
      setEventModalities((prev) => prev.filter((m) => m.id !== modalityId))
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof ApiError ? (err.detail || err.message) : 'No se pudo eliminar la modalidad.',
        variant: 'destructive',
      })
    }
  }

  const handlePublish = async () => {
    if (!event?.id) return
    setIsActionLoading(true)
    try {
      const updated = await eventsApi.publish(event.id)
      setEvent(updated)
      toast({ title: 'Evento publicado', description: 'El evento ya es visible para los participantes.' })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof ApiError ? (err.detail || err.message) : 'No se pudo publicar el evento.',
        variant: 'destructive',
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleOpenRegistration = async () => {
    if (!event?.id) return
    setIsActionLoading(true)
    try {
      const updated = await eventsApi.openRegistration(event.id)
      setEvent(updated)
      toast({ title: 'Inscripciones abiertas', description: 'Los participantes ya pueden inscribirse.' })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof ApiError ? (err.detail || err.message) : 'No se pudieron abrir las inscripciones.',
        variant: 'destructive',
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!event?.id) return
    setIsActionLoading(true)
    try {
      const updated = await eventsApi.complete(event.id)
      setEvent(updated)
      toast({ title: 'Evento completado' })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof ApiError ? (err.detail || err.message) : 'No se pudo completar el evento.',
        variant: 'destructive',
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!event?.id) return
    setIsActionLoading(true)
    try {
      await eventsApi.cancel(event.id)
      toast({ title: 'Evento cancelado', description: 'El evento ha sido cancelado correctamente.' })
      router.push('/dashboard/events')
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof ApiError ? (err.detail || err.message) : 'No se pudo cancelar el evento.',
        variant: 'destructive',
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const checkinUrl = (token: string) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${appUrl}/checkin/${eventId}?token=${token}`
  }

  const handleGenerateQr = async () => {
    setIsGeneratingQr(true)
    try {
      const data = await checkinApi.generateToken(eventId)
      setQrTokenData(data)
      setShowQrModal(true)
      setTimeout(async () => {
        if (qrCanvasRef.current) {
          const QRCode = await import('qrcode')
          await QRCode.toCanvas(qrCanvasRef.current, checkinUrl(data.token), { width: 240 })
        }
      }, 50)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof ApiError ? (err.detail || err.message) : 'Error al generar el QR.',
        variant: 'destructive',
      })
    } finally {
      setIsGeneratingQr(false)
    }
  }

  const handleCopyLink = async () => {
    if (!qrTokenData) return
    await navigator.clipboard.writeText(checkinUrl(qrTokenData.token))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportToCSV = () => {
    if (!event || participants.length === 0) return
    const headers = ['Nombre', 'Email', 'Talla', 'Playera', 'Sangre', 'Contacto emergencia', 'Tel. emergencia', 'Estado']
    const rows = participants.map((p) => [
      p.fullName, p.email, p.shirtSize, p.wantsShirt ? 'Sí' : 'No', p.bloodType,
      p.emergencyContactName, p.emergencyContactPhone, p.status,
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inscritos-${event.name ?? 'evento'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    event,
    participants,
    participantPage,
    participantTotalPages,
    participantTotalElements,
    setParticipantPage,
    eventModalities,
    stats: getEventStats(event ?? {}),
    isLoading,
    isActionLoading,
    isLoadingParticipants,
    showModalityForm,
    setShowModalityForm,
    modalityForm,
    setModalityForm,
    isSavingModality,
    modalityError,
    handleAddModality,
    handleDeleteModality,
    handlePublish,
    handleOpenRegistration,
    handleComplete,
    handleCancel,
    exportToCSV,
    showQrModal,
    setShowQrModal,
    qrTokenData,
    isGeneratingQr,
    copied,
    qrCanvasRef,
    handleGenerateQr,
    handleCopyLink,
    checkinUrl,
  }
}
