import type { Metadata } from 'next'
import Script from 'next/script'
import '@/styles/style.css'

export const metadata: Metadata = {
  title: { default: 'Cotch — Coffee & Good Vibes', template: '%s — Cotch' },
  description: 'Specialty coffee & comfortable space in Bandung.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Caveat:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/glightbox@3.3.0/dist/css/glightbox.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css" />
      </head>
      <body>
        {children}
        <Script src="https://unpkg.com/aos@2.3.4/dist/aos.js" strategy="afterInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js" strategy="afterInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/glightbox@3.3.0/dist/js/glightbox.min.js" strategy="afterInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js" strategy="afterInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/countup.js@2.8.0/dist/countUp.umd.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
