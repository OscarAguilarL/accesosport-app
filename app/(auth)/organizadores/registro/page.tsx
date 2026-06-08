'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { invitations } from '@/lib/api/invitations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ApiError } from '@/lib/api'

function OrganizerSignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signup, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingToken, setIsValidatingToken] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [accountExists, setAccountExists] = useState(false)
  const [invitationToken, setInvitationToken] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirmation: '',
  })

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace('/onboarding')
    }
  }, [isAuthenticated, isAuthLoading, router])

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token || isAuthLoading) return

    if (isAuthenticated) {
      // Flujo B — ya tiene sesión: guardar token y dejar que el redirect al onboarding se encargue
      localStorage.setItem('pendingInvitationToken', token)
      return
    }

    setIsValidatingToken(true)
    invitations.validate(token)
      .then((result) => {
        setInvitationToken(token)
        setFormData((prev) => ({ ...prev, email: result.email }))
        if (result.accountExists) {
          setAccountExists(true)
          localStorage.setItem('pendingInvitationToken', token)
        }
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          if (err.status === 409) {
            setTokenError('Este link de invitación ya fue utilizado.')
          } else if (err.status === 404) {
            setTokenError('Link de invitación inválido o no encontrado.')
          } else {
            setTokenError(err.detail || 'Error al validar la invitación.')
          }
        } else {
          setTokenError('No se pudo validar la invitación.')
        }
      })
      .finally(() => setIsValidatingToken(false))
  }, [searchParams, isAuthenticated, isAuthLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.passwordConfirmation) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    try {
      await signup(formData)
      if (invitationToken) {
        localStorage.setItem('pendingInvitationToken', invitationToken)
      }
      router.push('/onboarding')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message)
      } else {
        setError('Error al crear la cuenta. Por favor intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <svg
              className="h-6 w-6 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">Crear cuenta de organizador</CardTitle>
          <CardDescription>
            Regístrate para publicar y gestionar eventos deportivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tokenError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{tokenError}</AlertDescription>
            </Alert>
          )}

          {accountExists && invitationToken ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Ya existe una cuenta con el correo <strong>{formData.email}</strong>. Inicia sesión para continuar con tu registro como organizador.
                </AlertDescription>
              </Alert>
              <Button asChild className="w-full">
                <Link href={`/organizadores/login?redirect=/onboarding`}>
                  Iniciar sesión
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading || !!invitationToken}
                    readOnly={!!invitationToken}
                  />
                  {invitationToken && (
                    <p className="text-xs text-muted-foreground">
                      Este correo está asociado a tu invitación y no puede modificarse.
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="passwordConfirmation">Confirmar contraseña</FieldLabel>
                  <PasswordInput
                    id="passwordConfirmation"
                    placeholder="••••••••"
                    value={formData.passwordConfirmation}
                    onChange={(e) => setFormData({ ...formData, passwordConfirmation: e.target.value })}
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                </Field>

                <Button type="submit" className="w-full" disabled={isLoading || !!tokenError}>
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </Button>
              </FieldGroup>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/organizadores/login" className="font-medium text-primary hover:underline">
              Inicia sesión
            </Link>
          </div>
          <div className="mt-3 text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:underline">
              ← Volver al portal
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OrganizerSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    }>
      <OrganizerSignupContent />
    </Suspense>
  )
}
