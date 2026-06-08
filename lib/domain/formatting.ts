export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'

export function formatPrice(price?: number | null, fractionDigits = 0): string {
  if (price === undefined || price === null) return ''
  if (price === 0) return 'Gratis'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(price)
}

export function formatDateShort(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateNoWeekday(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-MX', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateLong(dateString?: string): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return (
    d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
  )
}

export function getStatusBadge(status?: string): { label: string; variant: BadgeVariant } {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    DRAFT:               { label: 'Borrador',               variant: 'secondary'   },
    PUBLISHED:           { label: 'Publicado',              variant: 'default'     },
    REGISTRATION_OPEN:   { label: 'Inscripciones Abiertas', variant: 'success'     },
    REGISTRATION_CLOSED: { label: 'Inscripciones Cerradas', variant: 'warning'     },
    IN_PROGRESS:         { label: 'En Curso',               variant: 'default'     },
    COMPLETED:           { label: 'Completado',             variant: 'outline'     },
    CANCELLED:           { label: 'Cancelado',              variant: 'destructive' },
  }
  return map[status ?? ''] ?? { label: status ?? '', variant: 'secondary' }
}
