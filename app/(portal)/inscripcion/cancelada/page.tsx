'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { payments as paymentsApi } from '@/lib/api'
import { getPaymentAccessToken } from '@/lib/api/payments'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export default function InscripcionCanceladaPage() {
  const registrationId = useSearchParams().get('registration_id')
  const [isReopening, setIsReopening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reopenCheckout = async () => {
    if (!registrationId) return
    setIsReopening(true)
    setError(null)
    try {
      const accessToken = getPaymentAccessToken(registrationId)
      const response = await paymentsApi.createCheckoutSession(registrationId, accessToken)
      if (response.paymentAlreadyCompleted) {
        window.location.href = `/inscripcion/exitosa?registration_id=${registrationId}`
      } else if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl
      } else {
        setError('No se pudo recuperar la sesión de pago.')
        setIsReopening(false)
      }
    } catch {
      setError('No se pudo reabrir el pago. Intenta de nuevo.')
      setIsReopening(false)
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-md">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-8 pb-6 text-center">
          <AlertCircle className="h-14 w-14 text-yellow-500" />
          <div>
            <h1 className="text-xl font-bold">Pago cancelado</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tu inscripción sigue pendiente. Puedes volver al checkout para completar el pago.
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" onClick={reopenCheckout} disabled={!registrationId || isReopening}>
            {isReopening ? <><Spinner className="mr-2 h-4 w-4" />Reabriendo...</> : 'Reintentar pago'}
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/eventos">Ver eventos</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
