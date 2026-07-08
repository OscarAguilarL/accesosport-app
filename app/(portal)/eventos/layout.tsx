import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Eventos deportivos',
  description: 'Descubre y únete a carreras, maratones y eventos deportivos en México.',
  openGraph: {
    title: 'Eventos deportivos — AccesoSport',
    description: 'Descubre y únete a carreras, maratones y eventos deportivos en México.',
    url: 'https://accesosport.com/eventos',
    siteName: 'AccesoSport',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'AccesoSport' }],
    locale: 'es_MX',
    type: 'website',
  },
}

export default function EventosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
