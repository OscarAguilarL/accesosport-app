'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  events as eventsApi,
  registrations as registrationsApi,
  modalities as modalitiesApi,
  ApiError,
} from '@/lib/api'
import type { EventResponse, RegistrationResponse, EventModalityResponse, EventImageResponse } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  CalendarDays,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Trophy,
  CheckCircle2,
  LogIn,
  Ruler,
} from 'lucide-react'

function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatPrice(price?: number): string {
  if (price === undefined || price === null) return '-'
  if (price === 0) return 'Gratis'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price)
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  REGISTRATION_OPEN: 'Inscripciones abiertas',
  REGISTRATION_CLOSED: 'Inscripciones cerradas',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Finalizado',
  CANCELLED: 'Cancelado',
}

const STATUS_MESSAGES: Record<string, string> = {
  DRAFT: 'Este evento aún no está publicado.',
  PUBLISHED: 'Las inscripciones aún no han abierto.',
  REGISTRATION_OPEN: '',
  REGISTRATION_CLOSED: 'Las inscripciones están cerradas.',
  IN_PROGRESS: 'Este evento ya está en curso.',
  COMPLETED: 'Este evento ha concluido.',
  CANCELLED: 'Este evento ha sido cancelado.',
}

function RegistrationCTA({
  event,
  modalities,
  myRegistration,
  isAuthenticated,
  eventId,
  compact = false,
}: {
  event: EventResponse
  modalities: EventModalityResponse[]
  myRegistration: RegistrationResponse | null
  isAuthenticated: boolean
  eventId: string
  compact?: boolean
}) {
  const isOpen = event.status === 'REGISTRATION_OPEN'
  const totalSpots = modalities.reduce((s, m) => s + m.availableSpots, 0)
  const hasSpots = modalities.length === 0 || totalSpots > 0
  const hasModalities = modalities.length > 0
  const minPrice = hasModalities ? Math.min(...modalities.map((m) => m.price)) : undefined

  if (myRegistration) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          <div>
            <p className="font-semibold text-green-800">¡Ya estás inscrito!</p>
            <p className="text-xs text-green-700 font-mono">{myRegistration.ticketCode}</p>
          </div>
        </div>
        <Button variant="outline" asChild className="w-full border-green-200 text-green-700 hover:bg-green-50">
          <Link href="/mis-inscripciones">Ver mis inscripciones →</Link>
        </Button>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-600">
          {STATUS_MESSAGES[event.status ?? ''] || 'Inscripciones no disponibles.'}
        </p>
      </div>
    )
  }

  if (!hasSpots && hasModalities) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm font-medium text-gray-600">Sin lugares disponibles</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        {!compact && (
          <p className="text-center text-sm text-gray-500">
            Inicia sesión para inscribirte
          </p>
        )}
        <Button
          asChild
          size="lg"
          className="w-full gap-2 bg-[#023765] font-bold text-white hover:bg-[#023765]/85"
        >
          <Link href={`/login?redirect=${encodeURIComponent(`/eventos/${eventId}/inscribirse`)}`}>
            <LogIn className="h-4 w-4" />
            {compact
              ? `Iniciar sesión${minPrice !== undefined ? ` · ${formatPrice(minPrice)}` : ''}`
              : 'Iniciar sesión para inscribirme'}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <Button
      asChild
      size="lg"
      className="font-barlow-condensed w-full bg-[#023765] text-lg font-bold uppercase tracking-wider text-white hover:bg-[#023765]/85 active:scale-[0.98] transition-transform"
    >
      <Link href={`/eventos/${eventId}/inscribirse`}>
        {compact && minPrice !== undefined
          ? `¡Inscribirme · ${formatPrice(minPrice)}!`
          : '¡Inscribirme ahora!'}
      </Link>
    </Button>
  )
}

export default function EventDetailClient() {
  const params = useParams()
  const eventId = params.eventId as string
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const [event, setEvent] = useState<EventResponse | null>(null)
  const [modalities, setModalities] = useState<EventModalityResponse[]>([])
  const [myRegistration, setMyRegistration] = useState<RegistrationResponse | null>(null)
  const [galleryImages, setGalleryImages] = useState<EventImageResponse[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      eventsApi.get(eventId),
      modalitiesApi.list(eventId).catch(() => [] as EventModalityResponse[]),
      eventsApi.getGallery(eventId).catch(() => []),
    ])
      .then(([eventData, modalitiesData, galleryData]) => {
        setEvent(eventData)
        setModalities(modalitiesData)
        const sorted = [...galleryData].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        setGalleryImages(sorted)
      })
      .catch((err) => {
        setError(err instanceof ApiError ? (err.detail || err.message) : 'Error al cargar el evento.')
      })
      .finally(() => setIsLoading(false))
  }, [eventId])

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevImage = useCallback(() =>
    setLightboxIndex((i) => (i === null ? null : (i - 1 + galleryImages.length) % galleryImages.length)),
    [galleryImages.length]
  )
  const nextImage = useCallback(() =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % galleryImages.length)),
    [galleryImages.length]
  )

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      registrationsApi
        .getMyRegistrations()
        .then((regs) => {
          const found = regs.find((r) => r.eventId === eventId && r.status !== 'CANCELLED')
          setMyRegistration(found ?? null)
        })
        .catch(() => {})
    }
  }, [isAuthenticated, isAuthLoading, eventId])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8 text-[#fb5d02]" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/eventos" className="flex items-center gap-1 text-gray-600">
            <ChevronLeft className="h-4 w-4" /> Volver a eventos
          </Link>
        </Button>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || 'Evento no encontrado.'}
        </div>
      </div>
    )
  }

  const hasModalities = modalities.length > 0
  const totalSpots = modalities.reduce((s, m) => s + m.availableSpots, 0)
  const minPrice = hasModalities ? Math.min(...modalities.map((m) => m.price)) : undefined
  const isOpen = event.status === 'REGISTRATION_OPEN'
  const showStickyMobileCTA = isOpen && !myRegistration

  return (
    <div className="pb-24 lg:pb-0">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/eventos" className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" /> Volver a eventos
        </Link>
      </Button>

      {/* Two-column layout: poster left, content right */}
      <div className="grid gap-6 lg:grid-cols-[2fr_3fr] lg:items-start lg:gap-8">

        {/* Left — title + metadata + poster (sticky on desktop) */}
        <div className="lg:sticky lg:top-24">
          {/* Title & metadata */}
          <div className="mb-4 space-y-2">
            <h1 className="font-barlow-condensed text-3xl font-extrabold uppercase leading-tight tracking-tight text-gray-900 sm:text-4xl">
              {event.name}
            </h1>
            <div className="flex flex-col gap-1.5 text-sm text-gray-500">
              {event.eventDate && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 shrink-0 text-[#fb5d02]" />
                  <span className="capitalize">{formatDate(event.eventDate)}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-[#fb5d02]" />
                  <span>
                    {[event.location.place, event.location.city, event.location.country]
                      .filter(Boolean)
                      .join(', ') || event.location.fullAddress}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Poster */}
          <div className="relative max-h-[480px] overflow-hidden rounded-2xl bg-black lg:max-h-none lg:aspect-[3/4]">
            {event.coverImageUrl ? (
              <>
                <img
                  src={event.coverImageUrl}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-[0.3]"
                />
                <img
                  src={event.coverImageUrl}
                  alt={event.name}
                  className="relative h-full w-full object-contain"
                  style={{ minHeight: '280px' }}
                />
              </>
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-[#023765] via-[#023765]/80 to-[#023765]/60">
                <Trophy className="h-24 w-24 text-white/15" />
              </div>
            )}
            {/* Status badge */}
            {event.status && (
              <div className="absolute left-3 top-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-lg ${
                    event.status === 'REGISTRATION_OPEN'
                      ? 'bg-green-500 text-white'
                      : 'bg-white/90 text-gray-800'
                  }`}
                >
                  {STATUS_LABELS[event.status] ?? event.status}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right — CTA + content sections */}
        <div className="space-y-6">
          {/* CTA card */}
          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-md">
            {minPrice !== undefined && (
              <div className="border-b border-gray-100 pb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Precio desde</p>
                <p className="font-barlow-condensed mt-1 text-5xl font-extrabold text-gray-900">
                  {formatPrice(minPrice)}
                </p>
                {hasModalities && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {modalities.length} modalidad{modalities.length !== 1 ? 'es' : ''}
                  </p>
                )}
              </div>
            )}
            {event.organizer?.email && (
              <div className="border-b border-gray-100 pb-4 text-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Organizador</p>
                <p className="mt-1 text-gray-700">{event.organizer.email}</p>
              </div>
            )}
            <RegistrationCTA
              event={event}
              modalities={modalities}
              myRegistration={myRegistration}
              isAuthenticated={isAuthenticated}
              eventId={eventId}
            />
          </div>

          {/* Places available */}
          {hasModalities && (
            <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Lugares disponibles</p>
                <p className="text-sm font-semibold text-gray-900">{totalSpots} lugares</p>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="font-barlow-condensed mb-3 text-xl font-bold uppercase tracking-wide text-gray-800">
                Acerca del evento
              </h2>
              <p className="leading-relaxed text-gray-600">{event.description}</p>
            </div>
          )}

          {/* Modalities */}
          {hasModalities && (
            <div>
              <h2 className="font-barlow-condensed mb-3 text-2xl font-bold uppercase tracking-wide text-gray-900">
                Modalidades
              </h2>
              <div className="space-y-3">
                {modalities.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                        <Ruler className="h-5 w-5 text-[#fb5d02]" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{m.name}</p>
                        <p className="text-sm text-gray-500">
                          {m.distance} {m.distanceUnit} ·{' '}
                          <span className={m.availableSpots === 0 ? 'text-red-500' : 'text-gray-500'}>
                            {m.availableSpots === 0 ? 'Sin lugares' : `${m.availableSpots} lugares`}
                          </span>
                        </p>
                      </div>
                    </div>
                    <p className="font-barlow-condensed shrink-0 text-2xl font-bold text-gray-900">
                      {formatPrice(m.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {galleryImages.length > 0 && (
            <div>
              <h2 className="font-barlow-condensed mb-3 text-2xl font-bold uppercase tracking-wide text-gray-900">
                Galería
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {galleryImages.map((img, index) => (
                  <button
                    key={img.id ?? index}
                    onClick={() => openLightbox(index)}
                    className="aspect-square overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fb5d02]"
                  >
                    <img
                      src={img.imageUrl}
                      alt={`Imagen ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lightbox */}
          <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && closeLightbox()}>
            <DialogContent className="max-w-4xl border-0 bg-black/95 p-0 shadow-none [&>button]:text-white [&>button]:opacity-80 [&>button]:hover:opacity-100">
              <DialogTitle className="sr-only">Galería de imágenes</DialogTitle>
              <div className="relative flex items-center justify-center" style={{ minHeight: '60vh' }}>
                {lightboxIndex !== null && galleryImages[lightboxIndex]?.imageUrl && (
                  <img
                    src={galleryImages[lightboxIndex].imageUrl}
                    alt={`Imagen ${lightboxIndex + 1} de ${galleryImages.length}`}
                    className="max-h-[80vh] max-w-full object-contain"
                  />
                )}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
                {lightboxIndex !== null && (
                  <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/50">
                    {lightboxIndex + 1} / {galleryImages.length}
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      {showStickyMobileCTA && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-sm lg:hidden">
          <RegistrationCTA
            event={event}
            modalities={modalities}
            myRegistration={myRegistration}
            isAuthenticated={isAuthenticated}
            eventId={eventId}
            compact
          />
        </div>
      )}
    </div>
  )
}
