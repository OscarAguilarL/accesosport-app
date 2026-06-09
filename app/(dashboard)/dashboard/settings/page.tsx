'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { profile as profileApi, auth as authApi, payments as paymentsApi, ApiError } from '@/lib/api'
import { PasswordInput } from '@/components/ui/password-input'
import type { OrganizerProfileResponse, ConnectStatusResponse } from '@/lib/types'
import { Globe, Instagram, Facebook, Save, Lock, CreditCard, CheckCircle2, ExternalLink } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function SettingsPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [organizerProfile, setOrganizerProfile] = useState<OrganizerProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [formData, setFormData] = useState({
    organizationName: '',
    website: '',
    facebook: '',
    instagram: '',
    description: '',
  })

  // Stripe Connect state
  const [connectStatus, setConnectStatus] = useState<ConnectStatusResponse | null>(null)
  const [isLoadingConnect, setIsLoadingConnect] = useState(true)
  const [isStartingOnboarding, setIsStartingOnboarding] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)

  const defaultTab = searchParams.get('tab') ?? 'perfil'

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.getOrganizer()
        setOrganizerProfile(data)
        setFormData({
          organizationName: data.organizationName || '',
          website: data.website || '',
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          description: data.description || '',
        })
      } catch (error) {
        console.log('[v0] Profile not found, user can create one')
      } finally {
        setIsLoading(false)
      }
    }

    const fetchConnectStatus = async () => {
      try {
        const status = await paymentsApi.getConnectStatus()
        setConnectStatus(status)
      } catch {
        // no-op — might not be an organizer yet
      } finally {
        setIsLoadingConnect(false)
      }
    }

    fetchProfile()
    fetchConnectStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const { profile } = await profileApi.createOrganizer(formData)
      setOrganizerProfile(profile)
    } catch (error) {
      console.log('[v0] Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setCurrentPasswordError(null)
    setPasswordSuccess(false)

    if (!passwordData.currentPassword) {
      setCurrentPasswordError('Ingresa tu contraseña actual.')
      return
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('La nueva contraseña y la confirmación no coinciden.')
      return
    }

    setIsChangingPassword(true)
    try {
      await authApi.changePassword(passwordData.currentPassword, passwordData.newPassword)
      setPasswordSuccess(true)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setCurrentPasswordError(err.detail || 'La contraseña actual no es correcta.')
      } else {
        setPasswordError('Ocurrió un error al cambiar la contraseña.')
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleLogoChange = async (file: File) => {
    setIsUploadingLogo(true)
    setLogoError(null)
    try {
      const updated = await profileApi.uploadOrganizerLogo(file)
      setOrganizerProfile(updated)
    } catch (err) {
      setLogoError(err instanceof ApiError ? (err.detail || err.message) : 'Error al subir el logo.')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleStartOnboarding = async () => {
    setIsStartingOnboarding(true)
    setConnectError(null)
    try {
      const origin = window.location.origin
      const returnUrl = `${origin}/dashboard/settings?tab=pagos`
      const refreshUrl = `${origin}/dashboard/settings?tab=pagos`
      const { onboardingUrl } = await paymentsApi.startOnboarding(returnUrl, refreshUrl)
      window.location.href = onboardingUrl
    } catch {
      setConnectError('No se pudo iniciar el proceso. Intenta de nuevo.')
      setIsStartingOnboarding(false)
    }
  }

  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((n) => n![0].toUpperCase())
    .join('') || (user?.email?.[0]?.toUpperCase() ?? '?')

  const fullName = [user?.firstName, user?.lastName]
    .filter(Boolean).join(' ') || null

  return (
    <DashboardLayout title="Configuración" description="Administra tu perfil y preferencias">
      <div className="mx-auto max-w-4xl px-0 py-2">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#E4ECFC]">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-[#2563EB] text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold text-[#0F172A]">
              {fullName ?? user?.email}
            </h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab} orientation="vertical"
          className="flex flex-col md:flex-row gap-6">

          <TabsList className="
            flex flex-row md:flex-col
            md:w-56 md:shrink-0 md:sticky md:top-24 md:self-start
            overflow-x-auto md:overflow-visible
            bg-white border border-[#E4ECFC] rounded-xl p-2
            gap-1 h-auto
          ">
            <TabsTrigger value="perfil" className="
              justify-start w-full text-left px-3 py-2 rounded-lg
              data-[state=active]:bg-[#F1F5FD]
              data-[state=active]:border-l-2
              data-[state=active]:border-[#2563EB]
              data-[state=active]:font-semibold
              data-[state=active]:text-[#0F172A]
              text-slate-500 hover:bg-muted/50
              transition-all duration-150
              whitespace-nowrap
            ">
              Perfil de Organizador
            </TabsTrigger>

            <TabsTrigger value="pagos" className="
              justify-start w-full text-left px-3 py-2 rounded-lg
              data-[state=active]:bg-[#F1F5FD]
              data-[state=active]:border-l-2
              data-[state=active]:border-[#2563EB]
              data-[state=active]:font-semibold
              data-[state=active]:text-[#0F172A]
              text-slate-500 hover:bg-muted/50
              transition-all duration-150
              whitespace-nowrap
            ">
              <CreditCard className="h-3 w-3 mr-2 shrink-0" />
              Pagos
            </TabsTrigger>

            <TabsTrigger value="seguridad" className="
              justify-start w-full text-left px-3 py-2 rounded-lg
              data-[state=active]:bg-[#F1F5FD]
              data-[state=active]:border-l-2
              data-[state=active]:border-[#2563EB]
              data-[state=active]:font-semibold
              data-[state=active]:text-[#0F172A]
              text-slate-500 hover:bg-muted/50
              transition-all duration-150
              whitespace-nowrap
            ">
              <Lock className="h-3 w-3 mr-2 shrink-0" />
              Seguridad
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-w-0">
            {/* Perfil de Organizador */}
            <TabsContent value="perfil">
              <Card>
                <CardHeader>
                  <CardTitle>Perfil de Organizador</CardTitle>
                  <CardDescription>
                    Información pública que aparecerá en tus eventos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex h-32 items-center justify-center">
                      <Spinner className="h-6 w-6" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-center">Logo de la organización</p>
                        <ImageDropzone
                          preview={organizerProfile?.logoUrl ?? null}
                          onChange={handleLogoChange}
                          onRemove={undefined}
                          disabled={isUploadingLogo}
                          shape="circle"
                          className="w-full"
                        />
                        {isUploadingLogo && (
                          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Spinner className="h-4 w-4" /> Subiendo logo...
                          </p>
                        )}
                        {logoError && (
                          <p className="text-center text-sm text-destructive">{logoError}</p>
                        )}
                      </div>

                      <form onSubmit={handleSubmit}>
                        <FieldGroup>
                          <Field>
                            <FieldLabel htmlFor="organizationName">
                              Nombre de la Organización *
                            </FieldLabel>
                            <Input
                              id="organizationName"
                              value={formData.organizationName}
                              onChange={(e) =>
                                setFormData({ ...formData, organizationName: e.target.value })
                              }
                              placeholder="Mi Organización Deportiva"
                              required
                              maxLength={120}
                            />
                          </Field>

                          <Field>
                            <FieldLabel htmlFor="description">Descripción</FieldLabel>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                              }
                              placeholder="Describe tu organización..."
                              rows={4}
                              maxLength={500}
                            />
                          </Field>

                          <Field>
                            <FieldLabel htmlFor="website">
                              <Globe className="mr-2 inline h-4 w-4" />
                              Sitio Web
                            </FieldLabel>
                            <Input
                              id="website"
                              type="url"
                              value={formData.website}
                              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                              placeholder="https://miorganizacion.com"
                              maxLength={200}
                            />
                          </Field>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field>
                              <FieldLabel htmlFor="facebook">
                                <Facebook className="mr-2 inline h-4 w-4" />
                                Facebook
                              </FieldLabel>
                              <Input
                                id="facebook"
                                value={formData.facebook}
                                onChange={(e) =>
                                  setFormData({ ...formData, facebook: e.target.value })
                                }
                                placeholder="facebook.com/miorganizacion"
                                maxLength={200}
                              />
                            </Field>

                            <Field>
                              <FieldLabel htmlFor="instagram">
                                <Instagram className="mr-2 inline h-4 w-4" />
                                Instagram
                              </FieldLabel>
                              <Input
                                id="instagram"
                                value={formData.instagram}
                                onChange={(e) =>
                                  setFormData({ ...formData, instagram: e.target.value })
                                }
                                placeholder="@miorganizacion"
                                maxLength={200}
                              />
                            </Field>
                          </div>

                          {organizerProfile?.verificationStatus && (
                            <div className="rounded-lg bg-muted p-4">
                              <p className="text-sm">
                                <span className="font-medium">Estado de verificación: </span>
                                <span className="text-muted-foreground">
                                  {organizerProfile.verificationStatus}
                                </span>
                              </p>
                            </div>
                          )}

                          <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                              <>
                                <Spinner className="mr-2" />
                                Guardando...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Guardar Cambios
                              </>
                            )}
                          </Button>
                        </FieldGroup>
                      </form>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pagos */}
            <TabsContent value="pagos">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Cuenta de Pagos (Stripe)
                  </CardTitle>
                  <CardDescription>
                    Conecta tu cuenta de Stripe para recibir pagos de inscripciones.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingConnect ? (
                    <div className="flex h-24 items-center justify-center">
                      <Spinner className="h-6 w-6" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {connectStatus?.chargesEnabled ? (
                        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-green-800">Cuenta conectada</p>
                            <p className="text-sm text-green-700 mt-0.5">
                              Tu cuenta de Stripe está activa y lista para recibir pagos.
                            </p>
                          </div>
                        </div>
                      ) : connectStatus?.stripeAccountId ? (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-3">
                          <p className="text-sm font-medium text-yellow-800">
                            Onboarding pendiente
                          </p>
                          <p className="text-sm text-yellow-700">
                            Tu cuenta de Stripe está creada pero necesitas completar el proceso de verificación para empezar a cobrar.
                          </p>
                          {connectError && (
                            <p className="text-sm text-destructive">{connectError}</p>
                          )}
                          <Button
                            onClick={handleStartOnboarding}
                            disabled={isStartingOnboarding}
                            size="sm"
                          >
                            {isStartingOnboarding ? (
                              <>
                                <Spinner className="mr-2 h-4 w-4" />
                                Redirigiendo...
                              </>
                            ) : (
                              <>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Completar verificación
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Para publicar eventos con costo y recibir pagos, necesitas conectar tu cuenta de Stripe.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Los participantes pagan directamente en el checkout de Stripe</li>
                            <li>Recibes el 100% del precio base de inscripción</li>
                            <li>AccesoSport retiene un cargo por servicio separado</li>
                          </ul>
                          {connectError && (
                            <p className="text-sm text-destructive">{connectError}</p>
                          )}
                          <Button
                            onClick={handleStartOnboarding}
                            disabled={isStartingOnboarding}
                          >
                            {isStartingOnboarding ? (
                              <>
                                <Spinner className="mr-2 h-4 w-4" />
                                Redirigiendo a Stripe...
                              </>
                            ) : (
                              <>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Conectar con Stripe
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seguridad */}
            <TabsContent value="seguridad">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Seguridad
                  </CardTitle>
                  <CardDescription>Cambia tu contraseña de acceso</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword}>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="currentPassword">Contraseña actual</FieldLabel>
                        <PasswordInput
                          id="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, currentPassword: e.target.value })
                          }
                          autoComplete="current-password"
                        />
                        {currentPasswordError && (
                          <p className="text-sm text-destructive">{currentPasswordError}</p>
                        )}
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="newPassword">Nueva contraseña</FieldLabel>
                        <PasswordInput
                          id="newPassword"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                          autoComplete="new-password"
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="confirmPassword">Confirmar nueva contraseña</FieldLabel>
                        <PasswordInput
                          id="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                          }
                          autoComplete="new-password"
                        />
                      </Field>

                      {passwordError && (
                        <p className="text-sm text-destructive">{passwordError}</p>
                      )}
                      {passwordSuccess && (
                        <p className="text-sm text-green-600">Contraseña actualizada correctamente.</p>
                      )}

                      <Button type="submit" disabled={isChangingPassword}>
                        {isChangingPassword ? (
                          <>
                            <Spinner className="mr-2" />
                            Cambiando...
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Cambiar contraseña
                          </>
                        )}
                      </Button>
                    </FieldGroup>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
