'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { ApiError } from '@/lib/api'

function OrganizerLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ email: '', password: '' })

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace(redirectTo || '/dashboard')
    }
  }, [isAuthenticated, isAuthLoading, router, redirectTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await login(formData)
      router.push(redirectTo || '/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message)
      } else {
        setError('Error al iniciar sesión. Por favor intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
            disabled={isLoading}
          />
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
          />
        </Field>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <><Spinner className="mr-2" />Iniciando sesión...</>
          ) : (
            'Iniciar sesión'
          )}
        </Button>
      </FieldGroup>
    </form>
  )
}

export default function OrganizerLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <CardTitle className="text-2xl">Panel de organizadores</CardTitle>
          <CardDescription>
            Accede para gestionar y publicar tus eventos deportivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Spinner className="mx-auto" />}>
            <OrganizerLoginForm />
          </Suspense>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link href="/organizadores/registro" className="font-medium text-primary hover:underline">
              Regístrate como organizador
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
