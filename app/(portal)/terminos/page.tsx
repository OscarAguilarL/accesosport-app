import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones — AccesoSport',
  description:
    'Términos y condiciones de uso de la plataforma AccesoSport para inscripción a eventos atléticos en México.',
}

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#fb5d02]">Legal</p>
        <h1 className="font-barlow-condensed mt-2 text-5xl font-extrabold uppercase text-gray-900 sm:text-6xl">
          Términos y Condiciones
        </h1>
        <p className="mt-4 text-base text-gray-600">
          Lee estos términos antes de usar la plataforma o inscribirte a un evento.
        </p>
      </div>

      <div className="space-y-8 text-gray-700">
        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            1. Objeto y aceptación
          </h2>
          <p className="leading-relaxed">
            AccesoSport es una plataforma de ticketing para eventos atléticos (carreras, ciclismo y
            actividades deportivas) que opera en México. Al crear una cuenta, inscribirte a un evento o
            navegar la plataforma, aceptas estos Términos y Condiciones en su totalidad. Si no estás de
            acuerdo, abstente de usar los servicios.
          </p>
        </section>

        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            2. Registro de cuenta
          </h2>
          <p className="leading-relaxed">
            Para inscribirte a un evento debes crear una cuenta con datos verídicos. Eres responsable
            de mantener la confidencialidad de tu contraseña y de toda la actividad que ocurra bajo tu
            sesión. AccesoSport no es responsable por pérdidas derivadas del uso no autorizado de tu
            cuenta. Notifícanos de inmediato si sospechas un acceso no autorizado.
          </p>
        </section>

        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            3. Inscripción a eventos
          </h2>
          <p className="leading-relaxed">
            Al inscribirte a un evento confirmas que cumples con los requisitos establecidos por el
            organizador (edad, categoría, condición física, etc.). Una vez completada la inscripción
            recibirás un boleto digital con código QR al correo registrado. Este boleto es personal e
            intransferible.
          </p>
          <p className="mt-3 leading-relaxed">
            AccesoSport actúa como intermediario tecnológico entre el participante y el organizador.
            La confirmación de inscripción no garantiza la celebración del evento; el organizador es
            responsable de comunicar cualquier cambio.
          </p>
        </section>

        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            4. Política de cancelaciones y reembolsos
          </h2>
          <ul className="list-disc space-y-2 pl-6 leading-relaxed">
            <li>
              <strong>Cancelación por el organizador:</strong> Si el evento es cancelado por el
              organizador, el participante recibirá un reembolso total del monto pagado. El
              organizador absorberá la comisión de procesamiento de Stripe.
            </li>
            <li>
              <strong>Cancelación por el participante (más de 15 días antes del evento):</strong>{" "}
              El participante recibirá un reembolso parcial del precio base de inscripción, menos
              una comisión de cancelación del 8%.
            </li>
            <li>
              <strong>Cancelación por el participante (15 días o menos antes del evento):</strong>{" "}
              No se realizará ningún reembolso.
            </li>
            <li>
              <strong>Tiempo de reembolso:</strong> Para pagos con tarjeta, el reembolso se
              acredita en un plazo de 5 a 10 días hábiles. Para pagos en OXXO, el reembolso se
              gestiona de forma manual; AccesoSport contactará al participante para coordinar el
              proceso.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            5. Responsabilidad del organizador
          </h2>
          <p className="leading-relaxed">
            El organizador del evento es el único responsable de la logística, seguridad, desarrollo
            y cumplimiento del evento. AccesoSport no tiene control sobre el contenido, la operación
            ni las condiciones del evento. Cualquier reclamación relacionada con el evento debe
            dirigirse directamente al organizador.
          </p>
        </section>

        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            6. Limitación de responsabilidad de AccesoSport
          </h2>
          <p className="leading-relaxed">
            AccesoSport opera como intermediario tecnológico y no es organizador ni coorganizador
            de ningún evento. No nos hacemos responsables por daños personales, materiales o
            económicos relacionados con la participación en los eventos publicados en la plataforma.
            Nuestra responsabilidad se limita exclusivamente a la correcta gestión de la inscripción
            y el procesamiento del pago.
          </p>
        </section>

        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            7. Propiedad intelectual
          </h2>
          <p className="leading-relaxed">
            Los logos, imágenes, nombres y demás materiales gráficos asociados a cada evento son
            propiedad de los organizadores correspondientes. La marca AccesoSport, su logotipo y
            diseño de la plataforma son propiedad exclusiva de AccesoSport. Queda prohibida su
            reproducción o uso sin autorización escrita.
          </p>
        </section>

        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            8. Modificaciones
          </h2>
          <p className="leading-relaxed">
            AccesoSport se reserva el derecho de actualizar estos Términos y Condiciones en cualquier
            momento. Los cambios se comunicarán con al menos 15 días de anticipación mediante
            notificación en la plataforma o por correo electrónico. El uso continuado de la plataforma
            tras la entrada en vigor de los cambios implica la aceptación de los nuevos términos.
          </p>
        </section>

        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            9. Ley aplicable
          </h2>
          <p className="leading-relaxed">
            Estos Términos y Condiciones se rigen por la legislación vigente en los Estados Unidos
            Mexicanos. Para cualquier controversia derivada de su interpretación o cumplimiento, las
            partes se someten expresamente a la jurisdicción de los tribunales competentes de la
            Ciudad de México, renunciando a cualquier otro fuero que pudiera corresponderles por razón
            de su domicilio o por cualquier otra causa.
          </p>
        </section>
      </div>

      <p className="mt-12 border-t border-gray-100 pt-6 text-xs text-gray-400">
        Última actualización: Mayo 2026
      </p>
    </div>
  )
}
