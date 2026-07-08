import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad — AccesoSport',
  description:
    'Política de privacidad de AccesoSport: cómo recopilamos, usamos y protegemos tus datos personales.',
}

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#fb5d02]">Legal</p>
        <h1 className="font-barlow-condensed mt-2 text-5xl font-extrabold uppercase text-gray-900 sm:text-6xl">
          Política de Privacidad
        </h1>
        <p className="mt-4 text-base text-gray-600">
          Cómo recopilamos, usamos y protegemos tu información personal.
        </p>
      </div>

      <div className="space-y-8 text-gray-700">
        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            1. Responsable del tratamiento
          </h2>
          <p className="leading-relaxed">
            El responsable del tratamiento de tus datos personales es AccesoSport. Para cualquier
            consulta sobre el manejo de tu información puedes contactarnos en{' '}
            <a
              href="mailto:privacidad@accesosport.mx"
              className="font-medium text-[#023765] underline"
            >
              privacidad@accesosport.mx
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            2. Datos que recopilamos
          </h2>
          <p className="mb-2 leading-relaxed">
            Al registrarte y participar en eventos recopilamos los siguientes datos:
          </p>
          <ul className="list-disc space-y-1 pl-6 leading-relaxed">
            <li>Nombre completo</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Género y fecha de nacimiento</li>
            <li>Talla de playera (cuando aplica)</li>
            <li>Tipo de sangre y contacto de emergencia</li>
          </ul>
          <p className="mt-3 leading-relaxed">
            Los datos de pago (número de tarjeta, CVV, etc.) son procesados directamente por Stripe,
            nuestro proveedor de pagos certificado PCI-DSS. AccesoSport no almacena ni tiene acceso
            a tus datos de tarjeta.
          </p>
        </section>

        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            3. Finalidad
          </h2>
          <p className="mb-2 leading-relaxed">
            Utilizamos tus datos exclusivamente para:
          </p>
          <ul className="list-disc space-y-1 pl-6 leading-relaxed">
            <li>Gestionar tu inscripción y generar tu boleto digital</li>
            <li>Enviarte confirmaciones y actualizaciones sobre el evento</li>
            <li>Facilitar el check-in digital el día del evento</li>
            <li>Comunicaciones operativas relacionadas con tu cuenta</li>
          </ul>
        </section>

        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            4. Base legal
          </h2>
          <p className="leading-relaxed">
            El tratamiento de tus datos se basa en el consentimiento que otorgas al crear una cuenta
            y al inscribirte a un evento. Puedes retirar tu consentimiento en cualquier momento
            contactándonos, lo que podría implicar la imposibilidad de continuar usando el servicio.
          </p>
        </section>

        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            5. Compartir datos
          </h2>
          <p className="leading-relaxed">
            AccesoSport comparte únicamente los datos necesarios con el organizador del evento al
            que te inscribes: nombre, correo electrónico, talla de playera y categoría de
            participación. No vendemos ni compartimos tus datos con terceros para fines publicitarios.
          </p>
        </section>

        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            6. Derechos ARCO
          </h2>
          <p className="leading-relaxed">
            Tienes derecho de Acceso, Rectificación, Cancelación y Oposición (ARCO) respecto a tus
            datos personales. Para ejercer cualquiera de estos derechos, envía una solicitud a{' '}
            <a
              href="mailto:privacidad@accesosport.mx"
              className="font-medium text-[#023765] underline"
            >
              privacidad@accesosport.mx
            </a>{' '}
            indicando tu nombre, correo registrado y el derecho que deseas ejercer. Atenderemos tu
            solicitud en un plazo máximo de 20 días hábiles.
          </p>
        </section>

        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            7. Cookies
          </h2>
          <p className="leading-relaxed">
            AccesoSport utiliza cookies de sesión estrictamente necesarias para el funcionamiento
            de la plataforma (autenticación y preferencias de navegación). No utilizamos cookies
            de seguimiento publicitario ni compartimos información de navegación con terceros.
          </p>
        </section>

        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            8. Seguridad
          </h2>
          <p className="leading-relaxed">
            Implementamos medidas técnicas y organizativas para proteger tus datos: conexiones
            cifradas (HTTPS/TLS), autenticación mediante tokens JWT de vida limitada y acceso
            restringido a datos personales. Los datos de tarjeta nunca son almacenados en nuestros
            servidores; Stripe los maneja bajo estándar PCI-DSS.
          </p>
        </section>

        <section>
          <h2 className="font-barlow-condensed mb-2 text-2xl font-extrabold uppercase text-[#023765]">
            9. Contacto
          </h2>
          <p className="leading-relaxed">
            Para cualquier pregunta, solicitud o queja relacionada con el tratamiento de tus datos
            personales, contáctanos en{' '}
            <a
              href="mailto:privacidad@accesosport.mx"
              className="font-medium text-[#023765] underline"
            >
              privacidad@accesosport.mx
            </a>
            .
          </p>
        </section>
      </div>

      <p className="mt-12 border-t border-gray-100 pt-6 text-xs text-gray-400">
        Última actualización: Mayo 2026
      </p>
    </div>
  )
}
