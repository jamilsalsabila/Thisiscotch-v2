import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import BookingClient from '@/components/booking/BookingClient'
import LookupClient from '@/components/lookup/LookupClient'

export const metadata: Metadata = { title: 'Reserve a Table' }

const getFloorTables = unstable_cache(
  async () => {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('floor_tables')
      .select('*')
      .order('id')
    return data ?? []
  },
  ['floor_tables'],
  { revalidate: 300 }
)

export default async function BookingPage() {
  const tables = await getFloorTables()
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="section-label" data-copy-en="Table Reservation" data-copy-id="Reservasi Meja">Table Reservation</div>
          <h1 data-copy-en="Reserve Your Table" data-copy-id="Reservasi Meja">Reserve Your Table</h1>
          <p data-copy-en="Pick a table, choose your time, get your ticket." data-copy-id="Pilih meja, tentukan waktu, dan dapatkan tiketmu.">Pick a table, choose your time, get your ticket.</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <BookingClient tables={tables} />

          <div style={{ marginTop: 48 }}>
            <div className="lookup-box">
              <h3 data-copy-en="Find My Booking" data-copy-id="Cari Booking Saya">Find My Booking</h3>
              <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: 16 }} data-copy-en="Enter your booking code to view or cancel." data-copy-id="Masukkan kode booking Anda untuk melihat atau membatalkan.">Enter your booking code to view or cancel.</p>
              <div style={{ maxWidth: 640 }}>
                <LookupClient embedded />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
