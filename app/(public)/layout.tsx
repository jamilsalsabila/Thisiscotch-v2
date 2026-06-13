import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getSiteData } from '@/lib/site'
import FloatingButtons from '@/components/home/FloatingButtons'
import PublicEnhancements from '@/components/layout/PublicEnhancements'
import { PublicLanguageProvider } from '@/components/layout/PublicLanguageProvider'
import { getPublicLang } from '@/lib/server-lang'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [site, lang] = await Promise.all([getSiteData(), getPublicLang()])

  return (
    <PublicLanguageProvider initialLang={lang}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <PublicEnhancements />
        <div id="toastWrap" className="toast-wrap" />
        <Navbar />
        <main style={{ flex: 1, paddingTop: 'var(--nav-h)' }}>
          {children}
        </main>
        <FloatingButtons whatsappUrl={`${site.socialWhatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`} />
        <Footer site={site} lang={lang} />
      </div>
    </PublicLanguageProvider>
  )
}
