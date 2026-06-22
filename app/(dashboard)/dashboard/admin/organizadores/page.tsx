'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { admin } from '@/lib/api/admin'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'
import { ApiError } from '@/lib/api'
import type { AdminOrganizerListItem, OrganizerVerificationStatus } from '@/lib/types'
import { Users } from 'lucide-react'

const STATUS_LABEL: Record<OrganizerVerificationStatus, string> = {
  NOT_SUBMITTED: 'Sin enviar',
  PENDING_REVIEW: 'En revisión',
  VERIFIED: 'Verificado',
  REJECTED: 'Rechazado',
}

const STATUS_VARIANT: Record<
  OrganizerVerificationStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  NOT_SUBMITTED: 'secondary',
  PENDING_REVIEW: 'default',
  VERIFIED: 'outline',
  REJECTED: 'destructive',
}

export default function AdminOrganizadoresPage() {
  const router = useRouter()
  const { roles, isLoading: isAuthLoading } = useAuth()
  const [items, setItems] = useState<AdminOrganizerListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [reminderPendingId, setReminderPendingId] = useState<string | null>(null)
  const [reminderSuccess, setReminderSuccess] = useState<string | null>(null)
  const [reminderTarget, setReminderTarget] = useState<AdminOrganizerListItem | null>(null)

  useEffect(() => {
    if (!isAuthLoading && !roles.includes('ROLE_ADMIN')) {
      router.replace('/dashboard')
    }
  }, [roles, isAuthLoading, router])

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await admin.listOrganizers()
      setItems(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthLoading && roles.includes('ROLE_ADMIN')) {
      load()
    }
  }, [isAuthLoading, roles, load])

  const handleAction = async (
    id: string,
    action: () => Promise<AdminOrganizerListItem>
  ) => {
    setPendingId(id)
    setActionError(null)
    try {
      const updated = await action()
      setItems((prev) => prev.map((item) => (item.organizerProfileId === id ? updated : item)))
    } catch (err) {
      setActionError(err instanceof ApiError ? (err.detail || err.message) : 'Ocurrió un error.')
    } finally {
      setPendingId(null)
    }
  }

  const handleSendReminder = async (id: string, orgName: string) => {
    setReminderPendingId(id)
    setActionError(null)
    setReminderSuccess(null)
    try {
      await admin.remindStripeOnboarding(id)
      setReminderSuccess(`Recordatorio enviado a ${orgName}.`)
    } catch (err) {
      setActionError(err instanceof ApiError ? (err.detail || err.message) : 'Error al enviar el recordatorio.')
    } finally {
      setReminderPendingId(null)
    }
  }

  if (isAuthLoading || (isLoading && items.length === 0)) {
    return (
      <DashboardLayout title="Organizadores">
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <TooltipProvider>
      <DashboardLayout title="Organizadores">
        <div className="space-y-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Verificación de organizadores</h1>
            <p className="text-sm text-muted-foreground">
              Panel exclusivo de admin — aprueba o rechaza la verificación de organizadores
            </p>
          </div>

          {actionError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {actionError}
            </div>
          )}

          {reminderSuccess && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
              {reminderSuccess}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {items.length} organizador{items.length !== 1 ? 'es' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                  <Users className="h-8 w-8" />
                  <p className="text-sm">No hay organizadores registrados</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organización</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-center">Datos</TableHead>
                      <TableHead className="text-center">Stripe</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((org) => {
                      const isBusy = pendingId === org.organizerProfileId
                      const isReminderBusy = reminderPendingId === org.organizerProfileId
                      const canApprove = org.personalDataComplete && org.stripeLinked
                      const approveDisabledReason = !org.personalDataComplete
                        ? 'Le faltan datos personales o dirección'
                        : !org.stripeLinked
                        ? 'No tiene Stripe Connect activo'
                        : null

                      return (
                        <TableRow key={org.organizerProfileId}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {org.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={org.logoUrl}
                                  alt={org.organizationName}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                  {org.organizationName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="font-medium">{org.organizationName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{org.email}</TableCell>
                          <TableCell>
                            <Badge variant={STATUS_VARIANT[org.verificationStatus]}>
                              {STATUS_LABEL[org.verificationStatus]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {org.personalDataComplete ? (
                              <span className="text-green-600">✅</span>
                            ) : (
                              <span className="text-yellow-500">⚠️</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {org.stripeLinked ? (
                              <span className="text-green-600">✅</span>
                            ) : (
                              <span className="text-yellow-500">⚠️</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!org.stripeLinked && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isReminderBusy}
                                  onClick={() => setReminderTarget(org)}
                                >
                                  {isReminderBusy ? <Spinner className="mr-1" /> : null}
                                  Recordatorio Stripe
                                </Button>
                              )}

                              {org.verificationStatus !== 'VERIFIED' && (
                                approveDisabledReason ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <Button size="sm" variant="outline" disabled>
                                          Aprobar
                                        </Button>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{approveDisabledReason}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={isBusy || !canApprove}
                                    onClick={() =>
                                      handleAction(org.organizerProfileId, () =>
                                        admin.approveOrganizer(org.organizerProfileId)
                                      )
                                    }
                                  >
                                    {isBusy ? <Spinner className="mr-1" /> : null}
                                    Aprobar
                                  </Button>
                                )
                              )}

                              {org.verificationStatus === 'PENDING_REVIEW' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={isBusy}
                                  onClick={() =>
                                    handleAction(org.organizerProfileId, () =>
                                      admin.rejectOrganizer(org.organizerProfileId)
                                    )
                                  }
                                >
                                  {isBusy ? <Spinner className="mr-1" /> : null}
                                  Rechazar
                                </Button>
                              )}

                              {org.verificationStatus === 'REJECTED' && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  disabled={isBusy}
                                  onClick={() =>
                                    handleAction(org.organizerProfileId, () =>
                                      admin.submitOrganizerForReview(org.organizerProfileId)
                                    )
                                  }
                                >
                                  {isBusy ? <Spinner className="mr-1" /> : null}
                                  Reactivar revisión
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>

      <AlertDialog open={!!reminderTarget} onOpenChange={(open) => { if (!open) setReminderTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar recordatorio de Stripe</AlertDialogTitle>
            <AlertDialogDescription>
              Se enviará un email a <strong>{reminderTarget?.email}</strong> con instrucciones para conectar su cuenta de Stripe. ¿Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (reminderTarget) {
                  handleSendReminder(reminderTarget.organizerProfileId, reminderTarget.organizationName)
                  setReminderTarget(null)
                }
              }}
            >
              Enviar recordatorio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}
