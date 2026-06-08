import type { Metadata } from 'next'
import { events } from '@/lib/api'
import { formatDateLong } from '@/lib/domain/formatting'
import EventDetailClient from './EventDetailClient'

export async function generateMetadata(
  { params }: { params: Promise<{ eventId: string }> }
): Promise<Metadata> {
  const { eventId } = await params
  const event = await events.get(eventId).catch(() => null)

  if (!event) return { title: 'Evento no encontrado' }

  const title = event.name ?? 'Evento'
  const description =
    event.description ??
    `Inscríbete al evento ${event.name} el ${formatDateLong(event.eventDate)} en ${event.location?.city ?? 'México'}.`
  const imageUrl = event.coverImageUrl ?? '/og-default.jpg'
  const eventUrl = `https://accesosport.com/eventos/${event.id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: eventUrl,
      siteName: 'AccesoSport',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      type: 'website',
      locale: 'es_MX',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: { canonical: eventUrl },
  }
}

export default function EventDetailPage() {
  return <EventDetailClient />
}
