import { Trophy, Users, Zap, CheckCircle2, MapPin } from 'lucide-react'

export default function AcercaDePage() {
  return (
    <div className="mx-auto max-w-3xl">
      {/* Hero */}
      <div className="mb-12 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#fb5d02]">Quiénes somos</p>
        <h1 className="font-barlow-condensed mt-2 text-5xl font-extrabold uppercase text-gray-900 sm:text-6xl">
          Acerca de AccesoSport
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          La plataforma de ticketing pensada para carreras atléticas en México.
        </p>
      </div>

      {/* Misión */}
      <section className="mb-12">
        <div className="rounded-2xl bg-[#023765] p-8 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-[#fb5d02]">Nuestra misión</p>
          <blockquote className="font-barlow-condensed mt-3 text-3xl font-extrabold uppercase leading-tight sm:text-4xl">
            "Que organizar una carrera sea tan emocionante como correrla."
          </blockquote>
          <p className="mt-4 text-white/75 text-base leading-relaxed">
            Creemos que detrás de cada evento hay una comunidad que merece la mejor experiencia posible —
            desde el momento en que el organizador crea el evento hasta que el corredor cruza la meta.
            AccesoSport existe para que la logística nunca sea el obstáculo.
          </p>
        </div>
      </section>

      {/* Para quién */}
      <section className="mb-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#023765]/15 bg-[#023765]/5 p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#023765]">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-barlow-condensed text-xl font-extrabold uppercase text-[#023765]">
            Para organizadores
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Crea tu evento, abre inscripciones y el día de la carrera solo preocúpate por correr.
            AccesoSport gestiona el resto: pagos, lista de participantes y check-in digital.
          </p>
        </div>
        <div className="rounded-2xl border border-[#fb5d02]/20 bg-[#fb5d02]/5 p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#fb5d02]">
            <Trophy className="h-5 w-5 text-black" />
          </div>
          <h3 className="font-barlow-condensed text-xl font-extrabold uppercase text-gray-900">
            Para participantes
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Encuentra tu próxima carrera, inscríbete en minutos y llega el día con tu boleto
            digital listo. Tu inscripción siempre está garantizada.
          </p>
        </div>
      </section>

      {/* Qué incluye */}
      <section className="mb-12">
        <p className="text-xs font-bold uppercase tracking-widest text-[#fb5d02]">
          Todo en un solo lugar
        </p>
        <h2 className="font-barlow-condensed mt-1 mb-6 text-3xl font-extrabold uppercase text-gray-900">
          Cómo funciona
        </h2>
        <ul className="space-y-4">
          {[
            'Panel de control para crear y gestionar eventos en minutos',
            'Inscripciones online con pago integrado — sin efectivo, sin transferencias manuales',
            'Lista de participantes con datos relevantes: talla, tipo de sangre y contacto de emergencia',
            'Boleto digital con código QR enviado automáticamente al corredor',
            'Check-in digital el día del evento — rápido y sin filas',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#fb5d02]" />
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Mercado */}
      <section className="mb-12">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-[#023765]" />
            <h2 className="font-barlow-condensed text-2xl font-extrabold uppercase text-gray-900">
              Dónde operamos
            </h2>
          </div>
          <p className="text-gray-600">
            AccesoSport está disponible en México con enfoque principal en Hidalgo — Actopan,
            Pachuca y la región del Valle del Mezquital. También atendemos eventos en Ciudad de
            México, Guadalajara y Monterrey. Apoyamos carreras desde 50 hasta varios miles de
            participantes — desde una 5K local hasta un maratón regional.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-[#023765] p-8 text-center text-white">
        <Zap className="mx-auto mb-3 h-8 w-8 text-[#fb5d02]" />
        <h2 className="font-barlow-condensed text-3xl font-extrabold uppercase">
          ¿Quieres organizar un evento?
        </h2>
        <p className="mt-2 text-white/80">
          Somos la herramienta más sencilla para poner en marcha tu carrera.
        </p>
        <a
          href="/contacto"
          className="mt-5 inline-block rounded-xl bg-[#fb5d02] px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-black transition-colors hover:bg-[#d95002]"
        >
          Contáctanos
        </a>
      </section>
    </div>
  )
}
