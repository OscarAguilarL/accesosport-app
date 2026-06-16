'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { payments as paymentsApi } from '@/lib/api'
import { savePaymentAccessToken } from '@/lib/api/payments'

export default function RetomarInscripcionPage() {
  const searchParams = useSearchParams()
  const registrationId = searchParams.get('registrationId')
  const token = searchParams.get('token')

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!registrationId || !token) return

    savePaymentAccessToken(registrationId, token)

    paymentsApi
      .createCheckoutSession(registrationId, token)
      .then((res) => {
        if (res.paymentAlreadyCompleted) {
          window.location.href = `/inscripcion/exitosa?registration_id=${registrationId}`
        } else if (res.checkoutUrl) {
          window.location.href = res.checkoutUrl
        } else {
          setError('No se pudo obtener el enlace de pago.')
        }
      })
      .catch(() => {
        setError('El enlace de pago expiró o ya no es válido.')
      })
  }, [registrationId, token])

  if (!registrationId || !token) {
    return (
      <div className="mx-auto max-w-md mt-16 text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <p className="font-semibold">Enlace inválido</p>
        <p className="text-sm text-muted-foreground">
          Este enlace no es válido. Revisa el correo que recibiste al inscribirte.
        </p>
        <Button asChild variant="outline">
          <Link href="/eventos">Ver eventos</Link>
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md mt-16">
        <Card>
          <CardContent className="pt-8 pb-6 flex flex-col items-center text-center gap-4">
            <AlertCircle className="h-14 w-14 text-destructive" />
            <div>
              <h2 className="text-xl font-bold">Enlace expirado</h2>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
            <Button asChild className="w-full">
              <Link href="/eventos">Ver eventos</Link>
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
            <h2 className="text-xl font-bold">Redirigiendo al pago</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Un momento, te estamos llevando a la pantalla de pago...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
