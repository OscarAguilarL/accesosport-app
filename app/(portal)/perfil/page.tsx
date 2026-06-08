'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { profile as profileApi, user as userApi, auth as authApi, ApiError } from '@/lib/api'
import type {
  CreateParticipantProfileRequest,
  SavePersonalDataRequest,
  ShirtSize,
  BloodType,
  Gender,
} from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PasswordInput } from '@/components/ui/password-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Save, UserCircle, User, Lock } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const SHIRT_SIZE_OPTIONS: { value: ShirtSize; label: string }[] = [
  { value: 'SIZE_XS', label: 'XS' },
  { value: 'SIZE_S', label: 'S' },
  { value: 'SIZE_M', label: 'M' },
  { value: 'SIZE_L', label: 'L' },
  { value: 'SIZE_XL', label: 'XL' },
  { value: 'SIZE_XXL', label: 'XXL' },
]

const BLOOD_TYPE_OPTIONS: { value: BloodType; label: string }[] = [
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'A_NEGATIVE', label: 'A-' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'B_NEGATIVE', label: 'B-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'O_NEGATIVE', label: 'O-' },
]

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'FEMENIL', label: 'Femenil' },
  { value: 'VARONIL', label: 'Varonil' },
  { value: 'OTRO', label: 'Otro' },
]

const EMPTY_PERSONAL_DATA: SavePersonalDataRequest = {
  firstName: '',
  lastName: '',
  secondLastName: '',
  birthDate: '',
  gender: '',
  phoneNumber: '',
}

const EMPTY_PROFILE: CreateParticipantProfileRequest = {
  shirtSize: 'SIZE_M',
  bloodType: 'O_POSITIVE',
  emergencyContactName: '',
  emergencyContactPhone: '',
  medicalConditions: '',
  phone: '',
  gender: 'FEMENIL',
}

export default function PerfilPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: isAuthLoading, user, refreshUser } = useAuth()

  // PersonalData section
  const [personalData, setPersonalData] = useState<SavePersonalDataRequest>(EMPTY_PERSONAL_DATA)
  const [isSavingPersonalData, setIsSavingPersonalData] = useState(false)
  const [personalDataSuccess, setPersonalDataSuccess] = useState<string | null>(null)
  const [personalDataError, setPersonalDataError] = useState<string | null>(null)

  // Change password section
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Participant profile section
  const [profileForm, setProfileForm] = useState<CreateParticipantProfileRequest>(EMPTY_PROFILE)
  const [profileExists, setProfileExists] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login?redirect=/perfil')
    }
  }, [isAuthenticated, isAuthLoading, router])

  // Pre-populate PersonalData from auth context user
  useEffect(() => {
    if (user) {
      setPersonalData({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        secondLastName: user.secondLastName ?? '',
        birthDate: user.birthDate ?? '',
        gender: user.gender ?? '',
        phoneNumber: user.phoneNumber ?? '',
      })
    }
  }, [user])

  // Load participant profile
  useEffect(() => {
    if (!isAuthenticated) return
    profileApi
      .getParticipant()
      .then((data) => {
        if (data.shirtSize && data.bloodType) {
          setProfileExists(true)
          setProfileForm({
            shirtSize: data.shirtSize,
            bloodType: data.bloodType,
            emergencyContactName: data.emergencyContactName || '',
            emergencyContactPhone: data.emergencyContactPhone || '',
            medicalConditions: data.medicalConditions || '',
            phone: data.phone || '',
            gender: data.gender || 'FEMENIL',
          })
        }
      })
      .catch((err) => {
        if (!(err instanceof ApiError && err.status === 404)) {
          setProfileError(
            err instanceof ApiError ? (err.detail || err.message) : 'Error al cargar el perfil.'
          )
        }
      })
      .finally(() => setIsLoadingProfile(false))
  }, [isAuthenticated])

  const handlePersonalDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!personalData.gender) {
      setPersonalDataError('Selecciona tu género para continuar.')
      return
    }
    setIsSavingPersonalData(true)
    setPersonalDataSuccess(null)
    setPersonalDataError(null)
    try {
      await userApi.savePersonalData(personalData)
      await refreshUser()
      setPersonalDataSuccess('Datos personales guardados correctamente.')
    } catch (err) {
      setPersonalDataError(
        err instanceof ApiError ? (err.detail || err.message) : 'Error al guardar los datos.'
      )
    } finally {
      setIsSavingPersonalData(false)
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    setProfileSuccess(null)
    setProfileError(null)
    try {
      const payload = { ...profileForm, medicalConditions: profileForm.medicalConditions || undefined }
      if (profileExists) {
        await profileApi.updateParticipant(payload)
      } else {
        const { token } = await profileApi.createParticipant(payload)
        localStorage.setItem('accessToken', token)
        setProfileExists(true)
      }
      setProfileSuccess('Perfil de corredor guardado correctamente.')
    } catch (err) {
      setProfileError(
        err instanceof ApiError ? (err.detail || err.message) : 'Error al guardar el perfil.'
      )
    } finally {
      setIsSavingProfile(false)
    }
  }

  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((n) => n![0].toUpperCase())
    .join('') || '?'

  const fullName = [user?.firstName, user?.lastName, user?.secondLastName]
    .filter(Boolean).join(' ') || null

  const triggerBase = `
    justify-start w-full text-left px-3 py-2 rounded-lg
    data-[state=active]:bg-[#F1F5FD]
    data-[state=active]:border-l-2
    data-[state=active]:border-[#2563EB]
    data-[state=active]:font-semibold
    data-[state=active]:text-[#0F172A]
    text-slate-500 hover:bg-muted/50
    transition-all duration-150
    whitespace-nowrap
  `.trim()

  if (isLoadingProfile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">

      {/* Encabezado de perfil */}
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

      {/* Tabs: sidebar + contenido */}
      <Tabs defaultValue="personal" orientation="vertical" className="flex flex-col md:flex-row gap-6">

        {/* Sidebar (desktop) / Pills (mobile) */}
        <TabsList className="
          flex flex-row md:flex-col
          md:w-56 md:shrink-0 md:sticky md:top-24 md:self-start
          overflow-x-auto md:overflow-visible
          bg-white border border-[#E4ECFC] rounded-xl p-2
          gap-1 h-auto
        ">
          <TabsTrigger value="personal" className={triggerBase}>
            Datos personales
          </TabsTrigger>

          <TabsTrigger value="corredor" className={triggerBase}>
            Perfil de corredor
          </TabsTrigger>

          <TabsTrigger value="seguridad" className={`${triggerBase} flex items-center`}>
            <Lock className="h-3 w-3 mr-2 shrink-0" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* Panel de contenido */}
        <div className="flex-1 min-w-0">

          {/* Datos personales */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Datos personales
                </CardTitle>
                <CardDescription>Tu nombre, fecha de nacimiento y contacto</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePersonalDataSubmit}>
                  <FieldGroup>
                    {personalDataSuccess && (
                      <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                        {personalDataSuccess}
                      </div>
                    )}
                    {personalDataError && (
                      <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {personalDataError}
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="firstName">Nombre *</FieldLabel>
                        <Input
                          id="firstName"
                          value={personalData.firstName}
                          onChange={(e) => setPersonalData({ ...personalData, firstName: e.target.value })}
                          required
                          disabled={isSavingPersonalData}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="lastName">Apellido paterno *</FieldLabel>
                        <Input
                          id="lastName"
                          value={personalData.lastName}
                          onChange={(e) => setPersonalData({ ...personalData, lastName: e.target.value })}
                          required
                          disabled={isSavingPersonalData}
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="secondLastName">Apellido materno</FieldLabel>
                      <Input
                        id="secondLastName"
                        value={personalData.secondLastName}
                        onChange={(e) => setPersonalData({ ...personalData, secondLastName: e.target.value })}
                        disabled={isSavingPersonalData}
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="birthDate">Fecha de nacimiento *</FieldLabel>
                        <Input
                          id="birthDate"
                          type="date"
                          value={personalData.birthDate}
                          onChange={(e) => setPersonalData({ ...personalData, birthDate: e.target.value })}
                          required
                          disabled={isSavingPersonalData}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="pdGender">Género *</FieldLabel>
                        <Select
                          value={personalData.gender}
                          onValueChange={(value) => setPersonalData({ ...personalData, gender: value })}
                          disabled={isSavingPersonalData}
                        >
                          <SelectTrigger id="pdGender">
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDER_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="phoneNumber">Teléfono *</FieldLabel>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="10 a 15 dígitos"
                        value={personalData.phoneNumber}
                        onChange={(e) => setPersonalData({ ...personalData, phoneNumber: e.target.value })}
                        required
                        minLength={10}
                        maxLength={15}
                        disabled={isSavingPersonalData}
                      />
                    </Field>

                    <Button type="submit" disabled={isSavingPersonalData}>
                      {isSavingPersonalData ? (
                        <><Spinner className="mr-2" /> Guardando...</>
                      ) : (
                        <><Save className="mr-2 h-4 w-4" /> Guardar datos personales</>
                      )}
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Perfil de corredor */}
          <TabsContent value="corredor">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  Perfil de corredor
                </CardTitle>
                <CardDescription>
                  Esta información es necesaria para inscribirte a una carrera
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit}>
                  <FieldGroup>
                    {profileSuccess && (
                      <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                        {profileSuccess}
                      </div>
                    )}
                    {profileError && (
                      <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {profileError}
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="shirtSize">Talla de playera *</FieldLabel>
                        <Select
                          value={profileForm.shirtSize}
                          onValueChange={(value) =>
                            setProfileForm({ ...profileForm, shirtSize: value as ShirtSize })
                          }
                          required
                          disabled={isSavingProfile}
                        >
                          <SelectTrigger id="shirtSize">
                            <SelectValue placeholder="Selecciona tu talla" />
                          </SelectTrigger>
                          <SelectContent>
                            {SHIRT_SIZE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="bloodType">Tipo de sangre *</FieldLabel>
                        <Select
                          value={profileForm.bloodType}
                          onValueChange={(value) =>
                            setProfileForm({ ...profileForm, bloodType: value as BloodType })
                          }
                          required
                          disabled={isSavingProfile}
                        >
                          <SelectTrigger id="bloodType">
                            <SelectValue placeholder="Selecciona tu tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {BLOOD_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="medicalConditions">Condiciones médicas</FieldLabel>
                      <Textarea
                        id="medicalConditions"
                        value={profileForm.medicalConditions}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, medicalConditions: e.target.value })
                        }
                        placeholder="Alergias, enfermedades, medicamentos actuales... (opcional)"
                        rows={3}
                        maxLength={500}
                        disabled={isSavingProfile}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="emergencyContactName">
                        Nombre del contacto de emergencia *
                      </FieldLabel>
                      <Input
                        id="emergencyContactName"
                        value={profileForm.emergencyContactName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, emergencyContactName: e.target.value })
                        }
                        placeholder="Nombre completo"
                        required
                        disabled={isSavingProfile}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="emergencyContactPhone">
                        Teléfono del contacto de emergencia *
                      </FieldLabel>
                      <Input
                        id="emergencyContactPhone"
                        type="tel"
                        value={profileForm.emergencyContactPhone}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, emergencyContactPhone: e.target.value })
                        }
                        placeholder="10 dígitos"
                        required
                        disabled={isSavingProfile}
                      />
                    </Field>

                    <Button type="submit" disabled={isSavingProfile}>
                      {isSavingProfile ? (
                        <><Spinner className="mr-2" /> Guardando...</>
                      ) : (
                        <><Save className="mr-2 h-4 w-4" /> Guardar perfil de corredor</>
                      )}
                    </Button>
                  </FieldGroup>
                </form>
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
                      <FieldLabel htmlFor="portalCurrentPassword">Contraseña actual</FieldLabel>
                      <PasswordInput
                        id="portalCurrentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        autoComplete="current-password"
                        disabled={isChangingPassword}
                      />
                      {currentPasswordError && (
                        <p className="text-sm text-destructive">{currentPasswordError}</p>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="portalNewPassword">Nueva contraseña</FieldLabel>
                      <PasswordInput
                        id="portalNewPassword"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        autoComplete="new-password"
                        disabled={isChangingPassword}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="portalConfirmPassword">Confirmar nueva contraseña</FieldLabel>
                      <PasswordInput
                        id="portalConfirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        autoComplete="new-password"
                        disabled={isChangingPassword}
                      />
                    </Field>

                    {passwordError && (
                      <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                        Contraseña actualizada correctamente.
                      </div>
                    )}

                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword ? (
                        <><Spinner className="mr-2" /> Cambiando...</>
                      ) : (
                        <><Lock className="mr-2 h-4 w-4" /> Cambiar contraseña</>
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
  )
}
