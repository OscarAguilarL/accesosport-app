'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { user as userApi, profile as profileApi, ApiError } from '@/lib/api'
import type { SavePersonalDataRequest, CreateParticipantProfileRequest, ShirtSize, BloodType, Gender } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

const STEPS = [
  { title: 'Información personal', description: 'Cuéntanos sobre ti' },
  { title: 'Perfil de corredor', description: 'Datos para tus inscripciones' },
]

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

export default function OnboardingParticipantePage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [personalData, setPersonalData] = useState<SavePersonalDataRequest>({
    firstName: '',
    lastName: '',
    secondLastName: '',
    birthDate: '',
    gender: '',
    phoneNumber: '',
  })

  const [participantProfile, setParticipantProfile] = useState<CreateParticipantProfileRequest>({
    shirtSize: 'SIZE_M',
    bloodType: 'O_POSITIVE',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    phone: '',
    gender: 'FEMENIL',
  })

  const handlePersonalDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!personalData.gender) {
      setError('Selecciona tu género para continuar.')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await userApi.savePersonalData(personalData)
      // Propagar género y teléfono al perfil para no pedirlos dos veces
      setParticipantProfile((prev) => ({
        ...prev,
        phone: personalData.phoneNumber,
        gender: (personalData.gender as Gender) || prev.gender,
      }))
      setStep(1)
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail || err.message) : 'Error al guardar la información.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleParticipantProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const payload = {
        ...participantProfile,
        medicalConditions: participantProfile.medicalConditions || undefined,
      }
      const { token } = await profileApi.createParticipant(payload)
      localStorage.setItem('accessToken', token)
      await refreshUser()
      router.push('/eventos')
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail || err.message) : 'Error al crear el perfil.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex justify-center items-center gap-2 mb-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    i < step
                      ? 'bg-primary text-primary-foreground'
                      : i === step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-8 ${i < step ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
          <CardTitle>{STEPS[step].title}</CardTitle>
          <CardDescription>{STEPS[step].description}</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === 0 && (
            <form onSubmit={handlePersonalDataSubmit}>
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="firstName">Nombre *</FieldLabel>
                    <Input
                      id="firstName"
                      value={personalData.firstName}
                      onChange={(e) => setPersonalData({ ...personalData, firstName: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastName">Apellido paterno *</FieldLabel>
                    <Input
                      id="lastName"
                      value={personalData.lastName}
                      onChange={(e) => setPersonalData({ ...personalData, lastName: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="secondLastName">Apellido materno</FieldLabel>
                  <Input
                    id="secondLastName"
                    value={personalData.secondLastName}
                    onChange={(e) => setPersonalData({ ...personalData, secondLastName: e.target.value })}
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="birthDate">Fecha de nacimiento *</FieldLabel>
                  <Input
                    id="birthDate"
                    type="date"
                    value={personalData.birthDate}
                    onChange={(e) => setPersonalData({ ...personalData, birthDate: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="gender">Género *</FieldLabel>
                  <Select
                    value={personalData.gender}
                    onValueChange={(value) => setPersonalData({ ...personalData, gender: value })}
                    disabled={isLoading}
                    required
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Selecciona tu género" />
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
                    disabled={isLoading}
                  />
                </Field>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Spinner className="mr-2" /> Guardando...</> : 'Continuar'}
                </Button>
              </FieldGroup>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={handleParticipantProfileSubmit}>
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="shirtSize">Talla de playera *</FieldLabel>
                    <Select
                      value={participantProfile.shirtSize}
                      onValueChange={(value) =>
                        setParticipantProfile({ ...participantProfile, shirtSize: value as ShirtSize })
                      }
                      required
                      disabled={isLoading}
                    >
                      <SelectTrigger id="shirtSize">
                        <SelectValue placeholder="Talla" />
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
                      value={participantProfile.bloodType}
                      onValueChange={(value) =>
                        setParticipantProfile({ ...participantProfile, bloodType: value as BloodType })
                      }
                      required
                      disabled={isLoading}
                    >
                      <SelectTrigger id="bloodType">
                        <SelectValue placeholder="Tipo" />
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
                  <FieldLabel htmlFor="emergencyContactName">Contacto de emergencia *</FieldLabel>
                  <Input
                    id="emergencyContactName"
                    placeholder="Nombre completo"
                    value={participantProfile.emergencyContactName}
                    onChange={(e) =>
                      setParticipantProfile({ ...participantProfile, emergencyContactName: e.target.value })
                    }
                    required
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="emergencyContactPhone">Teléfono de emergencia *</FieldLabel>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    placeholder="10 dígitos"
                    value={participantProfile.emergencyContactPhone}
                    onChange={(e) =>
                      setParticipantProfile({ ...participantProfile, emergencyContactPhone: e.target.value })
                    }
                    required
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="medicalConditions">Condiciones médicas</FieldLabel>
                  <Textarea
                    id="medicalConditions"
                    placeholder="Alergias, enfermedades, medicamentos actuales... (opcional)"
                    value={participantProfile.medicalConditions}
                    onChange={(e) =>
                      setParticipantProfile({ ...participantProfile, medicalConditions: e.target.value })
                    }
                    rows={3}
                    maxLength={500}
                    disabled={isLoading}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep(0)}
                    disabled={isLoading}
                  >
                    Atrás
                  </Button>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Spinner className="mr-2" /> Guardando...</> : 'Finalizar'}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
