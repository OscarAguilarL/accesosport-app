'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { invitations } from '@/lib/api/invitations'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { ApiError } from '@/lib/api'
import type { InvitationResponse, InvitationStatus, CreateInvitationRequest } from '@/lib/types'
import { INVITATION_STATUS_LABELS } from '@/lib/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Copy, Trash2, Plus, Mail } from 'lucide-react'

const STATUS_VARIANT: Record<InvitationStatus, 'default' | 'secondary' | 'destructive'> = {
  PENDING: 'default',
  USED: 'secondary',
  REVOKED: 'destructive',
}

export default function InvitacionesPage() {
  const router = useRouter()
  const { roles, isLoading: isAuthLoading } = useAuth()
  const [items, setItems] = useState<InvitationResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateInvitationRequest>({ email: '', reason: '' })

  useEffect(() => {
    if (!isAuthLoading && !roles.includes('ROLE_ADMIN')) {
      router.replace('/dashboard')
    }
  }, [roles, isAuthLoading, router])

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await invitations.list()
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)
    try {
      await invitations.create(formData)
      setDialogOpen(false)
      setFormData({ email: '', reason: '' })
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? (err.detail || err.message) : 'Error al crear la invitación.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevoke = async (token: string) => {
    try {
      await invitations.revoke(token)
      await load()
    } catch (err) {
      alert(err instanceof ApiError ? (err.detail || err.message) : 'Error al revocar la invitación.')
    }
  }

  const handleCopy = (token: string) => {
    const link = `${window.location.origin}/organizadores/registro?token=${token}`
    navigator.clipboard.writeText(link).then(() => {
      setCopyFeedback(token)
      setTimeout(() => setCopyFeedback(null), 2000)
    })
  }

  const formatDate = (iso?: string) => {
    if (!iso) return '—'
    return format(new Date(iso), 'dd MMM yyyy', { locale: es })
  }

  if (isAuthLoading || (isLoading && items.length === 0)) {
    return (
      <DashboardLayout title="Invitaciones">
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Invitaciones">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invitaciones</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona los links de acceso para nuevos organizadores
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva invitación
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {items.length} invitación{items.length !== 1 ? 'es' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <Mail className="h-8 w-8" />
                <p className="text-sm">No hay invitaciones todavía</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Correo</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.email}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {inv.reason || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[inv.status]}>
                          {INVITATION_STATUS_LABELS[inv.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(inv.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.status === 'PENDING' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(inv.token)}
                              >
                                <Copy className="h-4 w-4" />
                                <span className="ml-1.5 text-xs">
                                  {copyFeedback === inv.token ? '¡Copiado!' : 'Copiar link'}
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleRevoke(inv.token)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="ml-1.5 text-xs">Revocar</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva invitación</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <FieldGroup>
              {formError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="inv-email">Correo electrónico *</FieldLabel>
                <Input
                  id="inv-email"
                  type="email"
                  placeholder="organizador@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="inv-reason">Motivo</FieldLabel>
                <Input
                  id="inv-reason"
                  placeholder="Ej. Organizador carrera CDMX 2026"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  maxLength={500}
                  disabled={isSubmitting}
                />
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Spinner className="mr-2" />Enviando...</> : 'Enviar invitación'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
