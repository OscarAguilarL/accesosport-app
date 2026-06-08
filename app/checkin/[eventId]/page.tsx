'use client'

import { use, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCheckin } from '@/lib/hooks/useCheckin'
import { CheckCircle2, Package, QrCode, Search, XCircle, AlertTriangle } from 'lucide-react'
import { formatDateTime } from '@/lib/domain/formatting'

const SHIRT_SIZE_LABELS: Record<string, string> = {
  SIZE_XS: 'XS',
  SIZE_S: 'S',
  SIZE_M: 'M',
  SIZE_L: 'L',
  SIZE_XL: 'XL',
  SIZE_XXL: 'XXL',
}

const BLOOD_TYPE_LABELS: Record<string, string> = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
}

export default function PublicCheckinPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const ck = useCheckin(eventId, token)

  const {
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
  } = ck

  useEffect(() => {
    if (!showScanner) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scanner: any = null

    const initScanner = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true })
      } catch {
        setCameraError(true)
        setShowScanner(false)
        return
      }

      const { Html5QrcodeScanner } = await import('html5-qrcode')
      scanner = new Html5QrcodeScanner(
        'qr-reader-public',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      )
      scannerRef.current = scanner
      scanner.render(
        (decodedText: string) => {
          setCode(decodedText.toUpperCase())
          setShowScanner(false)
          scanner?.clear().catch(() => null)
          handleSearch(decodedText.toUpperCase())
        },
        () => null
      )
    }

    initScanner()

    return () => {
      scanner?.clear().catch(() => null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showScanner])

  if (isValidating) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-4 bg-background">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-bold text-center">Enlace no válido o expirado</h1>
        <p className="text-muted-foreground text-center max-w-sm">
          Este enlace ha expirado o no es válido. Pide al organizador que genere uno nuevo desde el detalle del evento.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <span className="font-semibold truncate max-w-[60%]">{eventName || 'Check-in'}</span>
          <div className="flex items-center gap-1.5 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            {isLoadingStats ? (
              <Spinner className="h-3.5 w-3.5" />
            ) : (
              <span className="font-medium tabular-nums">
                {kitsDelivered} / {totalConfirmed}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-lg space-y-5">

          <Card>
            <CardContent className="pt-5 space-y-3">
              <Input
                ref={inputRef}
                autoFocus
                placeholder="Código del boleto — ej: ACSP-4X7K"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="h-14 text-center font-mono text-xl tracking-widest"
                disabled={isSearching}
              />
              <div className="flex gap-2">
                <Button
                  className="h-12 flex-1 text-base"
                  onClick={() => handleSearch()}
                  disabled={!code.trim() || isSearching}
                >
                  {isSearching
                    ? <Spinner className="mr-2 h-4 w-4" />
                    : <Search className="mr-2 h-4 w-4" />}
                  Buscar
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-4"
                  onClick={() => { setCameraError(false); setShowScanner(true) }}
                  title="Escanear QR"
                >
                  <QrCode className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {deliveryError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Error al registrar la entrega. Verifica la conexión e intenta de nuevo.
              </AlertDescription>
            </Alert>
          )}
          {cameraError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                No se pudo acceder a la cámara. Para usar el escáner QR necesitas abrir la app por HTTPS o conceder permiso de cámara.
              </AlertDescription>
            </Alert>
          )}
          {searchError === 'not_found' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Código no válido o no pertenece a este evento.
              </AlertDescription>
            </Alert>
          )}
          {searchError === 'cancelled' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Esta inscripción fue cancelada.
              </AlertDescription>
            </Alert>
          )}

          {participant && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Inscripción válida</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {participant.ticketCode}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xl font-bold leading-tight">{participant.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    Dorsal #{participant.bibNumber ?? '—'}
                  </p>
                </div>

                <div className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                  participant.wantsShirt
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Package className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold leading-tight">
                      {participant.wantsShirt ? 'Kit CON playera' : 'Kit SIN playera'}
                    </p>
                    {participant.wantsShirt && participant.shirtSize && (
                      <p className="text-sm">
                        Talla {SHIRT_SIZE_LABELS[participant.shirtSize] ?? participant.shirtSize}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Talla de playera</p>
                    <p className="font-medium">
                      {participant.shirtSize
                        ? (SHIRT_SIZE_LABELS[participant.shirtSize] ?? participant.shirtSize)
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Grupo sanguíneo</p>
                    <p className="font-medium">
                      {participant.bloodType
                        ? (BLOOD_TYPE_LABELS[participant.bloodType] ?? participant.bloodType)
                        : '—'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Contacto de emergencia</p>
                    <p className="font-medium">
                      {participant.emergencyContactName} · {participant.emergencyContactPhone}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estado del kit</span>
                    {participant.kitPickedUp ? (
                      <Badge className="bg-success/15 text-success border-success/30">
                        Entregado ✓
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                        Pendiente
                      </Badge>
                    )}
                  </div>
                  {participant.kitPickedUp && participant.kitPickedUpAt && (
                    <p className="text-xs text-muted-foreground">
                      Entregado el {formatDateTime(participant.kitPickedUpAt)}
                    </p>
                  )}
                  <Button
                    className="h-14 w-full text-base"
                    onClick={handleDeliverKit}
                    disabled={participant.kitPickedUp || isDelivering}
                  >
                    {isDelivering
                      ? <Spinner className="mr-2 h-4 w-4" />
                      : <Package className="mr-2 h-5 w-5" />}
                    {participant.kitPickedUp ? 'Kit ya entregado' : 'Entregar kit'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {sessionHistory.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Últimas entregas (esta sesión)
              </p>
              <div className="divide-y rounded-lg border bg-card">
                {sessionHistory.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span>
                      {entry.bibNumber !== null ? `#${entry.bibNumber} ` : ''}
                      {entry.fullName}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{entry.deliveredAt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={showScanner} onOpenChange={handleCloseScanner}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Escanear código QR
            </DialogTitle>
          </DialogHeader>
          <div id="qr-reader-public" className="w-full" />
        </DialogContent>
      </Dialog>
    </div>
  )
}
