import type { Metadata } from 'next'
import LookupClient from '@/components/lookup/LookupClient'

export const metadata: Metadata = { title: 'My Booking' }

export default function LookupPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="section-label" data-copy-en="Status Check" data-copy-id="Cek Status">Status Check</div>
          <h1 data-copy-en="Find My Booking" data-copy-id="Cari Pesanan Saya">Find My Booking</h1>
          <p data-copy-en="Enter your booking, waitlist, or order code." data-copy-id="Masukkan kode booking, waitlist, atau order Anda.">Enter your booking, waitlist, or order code.</p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <LookupClient />
        </div>
      </section>
    </>
  )
}
