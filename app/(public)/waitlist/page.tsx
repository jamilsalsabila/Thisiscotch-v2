import type { Metadata } from 'next'
import WaitlistForm from '@/components/waitlist/WaitlistForm'
import { getPublicLang } from '@/lib/server-lang'

export const metadata: Metadata = { title: 'Waitlist' }

export default async function WaitlistPage() {
  const lang = await getPublicLang()
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="section-label" data-copy-en="When It's Full" data-copy-id="Saat Penuh">{lang === 'id' ? 'Saat Penuh' : 'When It’s Full'}</div>
          <h1 data-copy-en="Join the Waitlist" data-copy-id="Masuk Daftar Tunggu">{lang === 'id' ? 'Masuk Daftar Tunggu' : 'Join the Waitlist'}</h1>
          <p data-copy-en="All tables full? Get on the waitlist and we'll notify you when one opens up." data-copy-id="Semua meja penuh? Masuk daftar tunggu dan kami akan memberi tahu saat ada yang tersedia.">{lang === 'id' ? 'Semua meja penuh? Masuk daftar tunggu dan kami akan memberi tahu saat ada yang tersedia.' : 'All tables full? Get on the waitlist and we’ll notify you when one opens up.'}</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <WaitlistForm />
        </div>
      </section>
    </>
  )
}
