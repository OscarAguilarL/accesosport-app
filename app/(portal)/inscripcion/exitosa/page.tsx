'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { payments as paymentsApi } from '@/lib/api'
import type { PaymentStatusResponse } from '@/lib/types'

const POLL_INTERVAL_MS = 2500
const MAX_POLLS = 12 // 30s total

export default function InscripcionExitosaPage() {
  const searchParams = useSearchParams()
  const registrationId = searchParams.get('registration_id')

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null)
  const [timedOut, setTimedOut] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const pollCount = useRef(0)

  useEffect(() => {
    if (!registrationId) return

    const poll = async () => {
      try {
        const status = await paymentsApi.getPaymentStatus(registrationId)
        setPaymentStatus(status)

        if (status.paymentStatus === 'PENDING') {
          pollCount.current += 1
          if (pollCount.current >= MAX_POLLS) {
            setTimedOut(true)
            return
          }
          setTimeout(poll, POLL_INTERVAL_MS)
        }
      } catch {
        setFetchError(true)
      }
    }

    poll()
  }, [registrationId])

  if (!registrationId) {
    return (
      <div className="mx-auto max-w-md mt-16 text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Enlace inválido.</p>
        <Button asChild variant="outline">
          <Link href="/eventos">Ver eventos</Link>
        </Button>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="mx-auto max-w-md mt-16 text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <p className="font-semibold">No pudimos verificar tu pago</p>
        <p className="text-sm text-muted-foreground">
          Si realizaste el pago, recibirás un correo de confirmación cuando se procese.
        </p>
        <Button asChild variant="outline">
          <Link href="/mis-inscripciones">Ver mis inscripciones</Link>
        </Button>
      </div>
    )
  }

  // Polling — still PENDING
  if (!paymentStatus || paymentStatus.paymentStatus === 'PENDING') {
    if (timedOut) {
      return (
        <div className="mx-auto max-w-md mt-16">
          <Card>
            <CardContent className="pt-8 pb-6 flex flex-col items-center text-center gap-4">
              <Clock className="h-14 w-14 text-yellow-500" />
              <div>
                <h2 className="text-xl font-bold">Tu pago está en proceso</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Te notificaremos por correo cuando se confirme.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/mis-inscripciones">Ver mis inscripciones</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-md mt-16">
        <Card>
          <CardContent className="pt-8 pb-6 flex flex-col items-center text-center gap-4">
            <Spinner className="h-10 w-10" />
            <div>
              <h2 className="text-xl font-bold">Procesando tu pago</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Esto puede tomar unos segundos...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // CONFIRMED
  if (paymentStatus.paymentStatus === 'CONFIRMED') {
    if (paymentStatus.paymentMethod === 'OXXO') {
      return (
        <div className="mx-auto max-w-md mt-16">
          <Card>
            <CardContent className="pt-8 pb-6 flex flex-col items-center text-center gap-4">
              <Clock className="h-14 w-14 text-blue-500" />
              <div>
                <h2 className="text-xl font-bold">¡Pago recibido en OXXO!</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Tu inscripción está confirmada. Recibirás tu boleto por correo.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/mis-inscripciones">Ver mis inscripciones</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-md mt-16">
        <Card>
          <CardContent className="pt-8 pb-6 flex flex-col items-center text-center gap-4">
            <CheckCircle className="h-14 w-14 text-green-500" />
            <div>
              <h2 className="text-xl font-bold">¡Inscripción confirmada!</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Tu boleto fue enviado a tu correo electrónico.
              </p>
            </div>
            <div className="w-full rounded-lg border bg-muted/30 p-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inscripción</span>
                <span>${paymentStatus.baseAmount.toFixed(2)} MXN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cargo por servicio</span>
                <span>${paymentStatus.serviceFee.toFixed(2)} MXN</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 mt-1">
                <span>Total pagado</span>
                <span>${paymentStatus.amountTotal.toFixed(2)} MXN</span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/mis-inscripciones">Ver mis inscripciones</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // FAILED or unexpected
  return (
    <div className="mx-auto max-w-md mt-16">
      <Card>
        <CardContent className="pt-8 pb-6 flex flex-col items-center text-center gap-4">
          <AlertCircle className="h-14 w-14 text-destructive" />
          <div>
            <h2 className="text-xl font-bold">El pago no se completó</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Puedes intentarlo de nuevo desde el catálogo de eventos.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/eventos">Ver eventos</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
