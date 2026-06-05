'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('El enlace de recuperación no es válido. Por favor solicita uno nuevo.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await auth.resetPassword(token, newPassword)
      router.push('/login?mensaje=contrasena-actualizada')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message)
      } else {
        setError('Ocurrió un error. Por favor intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          El enlace de recuperación no es válido o ya expiró.
        </div>
        <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
          Solicitar un nuevo enlace
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}{' '}
            {(error.toLowerCase().includes('expirado') || error.toLowerCase().includes('inválido') || error.toLowerCase().includes('utilizado')) && (
              <Link href="/auth/forgot-password" className="font-medium underline">
                Solicitar uno nuevo
              </Link>
            )}
          </div>
        )}
        <Field>
          <FieldLabel htmlFor="newPassword">Nueva contraseña</FieldLabel>
          <PasswordInput
            id="newPassword"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirmar contraseña</FieldLabel>
          <PasswordInput
            id="confirmPassword"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </Field>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <><Spinner className="mr-2" />Actualizando contraseña...</>
          ) : (
            'Cambiar contraseña'
          )}
        </Button>
      </FieldGroup>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Spinner className="mx-auto" />}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
