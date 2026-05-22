'use client'

import { useState } from 'react'
import { Mail, CheckCircle2, Trophy, Users, Zap, Send, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'

export default function ContactoPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch(`${API_URL}/api/v1/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Hero */}
      <div className="mb-12 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#fb5d02]">Súmate a AccesoSport</p>
        <h1 className="font-barlow-condensed mt-2 text-5xl font-extrabold uppercase text-gray-900 sm:text-6xl">
          Conviértete en organizador
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          ¿Organizas carreras o quieres hacerlo? Escríbenos — te ayudamos a dar el primer paso.
        </p>
      </div>

      {/* Beneficios */}
      <section className="mb-12">
        <p className="text-xs font-bold uppercase tracking-widest text-[#fb5d02]">
          ¿Por qué unirte?
        </p>
        <h2 className="font-barlow-condensed mt-1 mb-6 text-3xl font-extrabold uppercase text-gray-900">
          Lo que obtienes como organizador
        </h2>
        <ul className="space-y-4">
          {[
            'Panel de control completo para crear y gestionar tus eventos',
            'Inscripciones online con pago integrado — sin transferencias manuales',
            'Lista de participantes exportable con todos los datos que necesitas',
            'Boleto digital con código QR enviado automáticamente a cada corredor',
            'Check-in digital el día del evento — rápido y sin filas',
            'Sin costo mensual: solo cobramos un pequeño cargo por servicio al participante',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#fb5d02]" />
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Para quién */}
      <section className="mb-12 grid gap-5 sm:grid-cols-3">
        {[
          {
            icon: Trophy,
            title: 'Eventos locales',
            desc: 'Carreras 5K, 10K o maratones en tu ciudad, desde 50 participantes.',
          },
          {
            icon: Users,
            title: 'Eventos regionales',
            desc: 'Organizaciones que realizan 1 a 4 eventos al año y buscan crecer.',
          },
          {
            icon: Zap,
            title: 'Primeros pasos',
            desc: '¿Tu primera carrera? Te acompañamos en todo el proceso.',
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-center"
          >
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#023765]">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-barlow-condensed text-lg font-extrabold uppercase text-gray-900">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </section>

      {/* Formulario */}
      <section className="rounded-2xl bg-[#023765] p-8 text-white">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fb5d02]">
            <Mail className="h-5 w-5 text-black" />
          </div>
          <div>
            <h2 className="font-barlow-condensed text-3xl font-extrabold uppercase">
              Escríbenos hoy
            </h2>
            <p className="text-sm text-white/70">Te respondemos en menos de 24 horas.</p>
          </div>
        </div>

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white/10 py-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-[#fb5d02]" />
            <p className="font-barlow-condensed text-2xl font-extrabold uppercase">¡Mensaje enviado!</p>
            <p className="text-sm text-white/70">Nos pondremos en contacto contigo pronto.</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-2 text-xs font-semibold text-white/50 underline hover:text-white/80"
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Nombre
                </label>
                <Input
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-[#fb5d02] focus-visible:ring-0"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Correo electrónico
                </label>
                <Input
                  required
                  type="email"
                  maxLength={150}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-[#fb5d02] focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Mensaje
              </label>
              <textarea
                required
                maxLength={2000}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntanos sobre tu evento: ciudad, distancias y fecha estimada..."
                className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#fb5d02] focus:outline-none resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-300">
                Hubo un error al enviar el mensaje. Inténtalo de nuevo.
              </p>
            )}

            <Button
              type="submit"
              disabled={status === 'sending'}
              className="gap-2 bg-[#fb5d02] text-black font-bold hover:bg-[#d95002] disabled:opacity-60"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar mensaje
                </>
              )}
            </Button>
          </form>
        )}
      </section>
    </div>
  )
}
