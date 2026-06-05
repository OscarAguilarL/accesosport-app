'use client'

import { useState } from 'react'
import Link from 'next/link'
import { auth, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await auth.forgotPassword(email)
      setSubmitted(true)
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
          <CardDescription>
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
                Si existe una cuenta con ese correo, recibirás un enlace en los próximos minutos.
              </div>
              <Link href="/login" className="text-sm font-medium text-primary hover:underline">
                Volver al inicio de sesión
              </Link>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <><Spinner className="mr-2" />Enviando enlace...</>
                  ) : (
                    'Enviar enlace'
                  )}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/login" className="text-muted-foreground hover:text-primary hover:underline">
                    Volver al inicio de sesión
                  </Link>
                </div>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
