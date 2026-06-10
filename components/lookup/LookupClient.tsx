'use client'

import { useState } from 'react'
import Link from 'next/link'
import { lookupRecord, cancelRecord } from '@/app/(public)/lookup/actions'
import { formatDateDisplay, formatRupiah } from '@/utils/format'
import { WordmarkLogo } from '@/components/ui/BrandLogo'

type LookupResult = Awaited<ReturnType<typeof lookupRecord>>

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function LookupClient({ embedded = false }: { embedded?: boolean }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LookupResult | null>(null)

  async function handleLookup() {
    setLoading(true)
    const res = await lookupRecord(code)
    setResult(res)
    setLoading(false)
  }

  async function handleCancel(type: 'booking' | 'waitlist' | 'order', refCode: string) {
    const res = await cancelRecord(type, refCode)
    if (!res.success) {
      setResult({ success: false, error: res.error })
      return
    }
    const refreshed = await lookupRecord(refCode)
    setResult(refreshed)
  }

  return (
    <>
      <div style={{
        background: embedded ? 'transparent' : 'var(--white)',
        border: embedded ? 'none' : '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: embedded ? 0 : 36,
        marginBottom: 32,
      }}>
        {!embedded && (
          <>
            <h3 style={{ marginBottom: 6 }} data-copy-en="Enter Your Code" data-copy-id="Masukkan Kode Anda">Enter Your Code</h3>
            <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: 20 }} data-copy-en="Your code was shown on the ticket/confirmation after booking, joining the waitlist, or placing an order." data-copy-id="Kode Anda ditampilkan pada tiket/konfirmasi setelah booking, masuk waitlist, atau membuat order.">
              Your code was shown on the ticket/confirmation after booking, joining the waitlist, or placing an order.
            </p>
          </>
        )}
        <div className="lookup-actions-row" style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
          <input
            type="text"
            className="form-input"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => { if (e.key === 'Enter') void handleLookup() }}
            placeholder="e.g. COTCH-250517-AB3XY or WL-... or ORD-..."
            data-placeholder-en="e.g. COTCH-250517-AB3XY or WL-... or ORD-..."
            data-placeholder-id="mis. COTCH-250517-AB3XY atau WL-... atau ORD-..."
            style={{ fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '.05em' }}
          />
          <button className={`btn btn--primary${loading ? ' btn--loading' : ''}`} onClick={() => void handleLookup()} disabled={loading}>
            {loading ? '' : <span data-copy-en="Look Up" data-copy-id="Cari">Look Up</span>}
          </button>
        </div>
        {!embedded && (
          <p style={{ fontSize: '.72rem', color: 'var(--muted)' }} data-copy-en="Booking codes start with `COTCH-`, waitlist with `WL-`, orders with `ORD-`." data-copy-id="Kode booking diawali `COTCH-`, waitlist `WL-`, dan order `ORD-`.">
            Booking codes start with `COTCH-`, waitlist with `WL-`, orders with `ORD-`.
          </p>
        )}
      </div>

      {result?.success === false && (
        <div style={{ padding: 24, background: 'rgba(220,38,38,.06)', border: '1.5px solid rgba(220,38,38,.2)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>{result.error}</p>
          <p style={{ fontSize: '.82rem', color: 'var(--muted)' }} data-copy-en="Double-check your code and try again." data-copy-id="Periksa kembali kode Anda lalu coba lagi.">Double-check your code and try again.</p>
        </div>
      )}

      {result?.success && result.type === 'booking' && (
        <div className="ticket">
          <div className="ticket__header">
            <WordmarkLogo />
            <div className="ticket__type" data-copy-en="Table Reservation" data-copy-id="Reservasi Meja">Table Reservation</div>
            <div className="ticket__code">{result.data.booking_code}</div>
          </div>
          <div className="ticket__body">
            <TicketRow label="Guest" value={result.data.guest_name} />
            <TicketRow label="Table" value={result.data.table_id} />
            <TicketRow label="Section" value={result.data.section ?? '—'} />
            <TicketRow label="Party" value={`${result.data.party_size} pax`} />
            <TicketRow label="Date" value={formatDateDisplay(result.data.booking_date)} />
            <TicketRow label="Time" value={result.data.booking_time} />
            <div className="ticket__row">
              <span className="ticket__key">Status</span>
              <span className="ticket__val">
                <span className={`ticket__status ${result.data.status === 'active' ? 'active' : 'cancelled'}`}>
                  ● {statusLabel(result.data.status)}
                </span>
              </span>
            </div>
            {result.data.special_request && <TicketRow label="Notes" value={result.data.special_request} />}
          </div>
          <div className="ticket__footer">
            {result.data.status === 'active' ? (
              <>
                <p data-copy-en="Show this ticket to our staff upon arrival." data-copy-id="Tunjukkan tiket ini kepada staf kami saat tiba.">Show this ticket to our staff upon arrival.</p>
                <div className="ticket-actions-row" style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
                  <Link href={`/reviews?code=${result.data.booking_code}`} className="btn btn--outline btn--sm"><span data-copy-en="Leave a Review" data-copy-id="Tinggalkan Ulasan">Leave a Review</span></Link>
                  <button className="btn btn--danger btn--sm" onClick={() => void handleCancel('booking', result.data.booking_code)}><span data-copy-en="Cancel Booking" data-copy-id="Batalkan Booking">Cancel Booking</span></button>
                </div>
              </>
            ) : (
              <>
                <p data-copy-en="This booking has been cancelled." data-copy-id="Booking ini telah dibatalkan.">This booking has been cancelled.</p>
                <Link href={`/reviews?code=${result.data.booking_code}`} className="btn btn--outline btn--sm" style={{ marginTop: 12 }}><span data-copy-en="Leave a Review" data-copy-id="Tinggalkan Ulasan">Leave a Review</span></Link>
              </>
            )}
          </div>
        </div>
      )}

      {result?.success && result.type === 'waitlist' && (
        <div className="ticket">
          <div className="ticket__header" style={{ background: 'var(--gold)' }}>
            <WordmarkLogo />
            <div className="ticket__type" data-copy-en="Waitlist" data-copy-id="Waitlist">Waitlist</div>
            <div className="ticket__code">{result.data.waitlist_code}</div>
          </div>
          <div className="ticket__body">
            <TicketRow label="Name" value={result.data.guest_name} />
            <TicketRow label="Party Size" value={`${result.data.party_size} pax`} />
            <TicketRow label="Preferred Date" value={formatDateDisplay(result.data.preferred_date)} />
            <TicketRow label="Preferred Time" value={result.data.preferred_time} />
            <TicketRow label="Queue Position" value={`#${result.data.position}`} />
            <div className="ticket__row">
              <span className="ticket__key">Status</span>
              <span className="ticket__val">
                <span className={`ticket__status ${result.data.status === 'waiting' ? 'active' : 'cancelled'}`}>
                  ● {statusLabel(result.data.status)}
                </span>
              </span>
            </div>
          </div>
          <div className="ticket__footer">
            {result.data.status === 'waiting' ? (
              <>
                <p data-copy-en="We'll contact you via WhatsApp when a table is available." data-copy-id="Kami akan menghubungi Anda via WhatsApp saat meja tersedia.">We&apos;ll contact you via WhatsApp when a table is available.</p>
                <button className="btn btn--danger btn--sm" style={{ marginTop: 12 }} onClick={() => void handleCancel('waitlist', result.data.waitlist_code)}><span data-copy-en="Leave Waitlist" data-copy-id="Keluar dari Waitlist">Leave Waitlist</span></button>
              </>
            ) : (
              <p data-copy-en="This waitlist entry is no longer active." data-copy-id="Entri waitlist ini sudah tidak aktif.">This waitlist entry is no longer active.</p>
            )}
          </div>
        </div>
      )}

      {result?.success && result.type === 'order' && (
        <div className="ticket">
          <div className="ticket__header" style={{ background: '#1a1a1a' }}>
            <WordmarkLogo />
            <div className="ticket__type" data-copy-en="Order" data-copy-id="Order">Order</div>
            <div className="ticket__code">{result.data.order_code}</div>
          </div>
          <div className="ticket__body">
            <TicketRow label="Name" value={result.data.guest_name} />
            <TicketRow label="Table" value={result.data.table_number || '—'} />
            <div style={{ padding: '8px 0', borderBottom: '1px dashed var(--border)' }}>
              {(result.data.order_items as Array<{ id: number; item_name: string; quantity: number; subtotal: number }>).map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', padding: '4px 0' }}>
                  <span>{item.item_name} × {item.quantity}</span>
                  <span>{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <TicketRow label="Total" value={formatRupiah(Number(result.data.total_amount))} />
            <div className="ticket__row">
              <span className="ticket__key">Status</span>
              <span className="ticket__val">
                <span className={`ticket__status ${['pending', 'confirmed'].includes(result.data.status) ? 'active' : 'cancelled'}`}>
                  ● {statusLabel(result.data.status)}
                </span>
              </span>
            </div>
          </div>
          <div className="ticket__footer">
            {['pending', 'confirmed'].includes(result.data.status) ? (
              <>
                <p data-copy-en="Your order is being processed." data-copy-id="Order Anda sedang diproses.">Your order is being processed.</p>
                <div className="ticket-actions-row" style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
                  <Link href={`/reviews?code=${result.data.order_code}`} className="btn btn--outline btn--sm"><span data-copy-en="Leave a Review" data-copy-id="Tinggalkan Ulasan">Leave a Review</span></Link>
                  <button className="btn btn--danger btn--sm" onClick={() => void handleCancel('order', result.data.order_code)}><span data-copy-en="Cancel Order" data-copy-id="Batalkan Order">Cancel Order</span></button>
                </div>
              </>
            ) : (
              <>
                <p><span data-copy-en="Status:" data-copy-id="Status:">Status:</span> {result.data.status}</p>
                <Link href={`/reviews?code=${result.data.order_code}`} className="btn btn--outline btn--sm" style={{ marginTop: 12 }}><span data-copy-en="Leave a Review" data-copy-id="Tinggalkan Ulasan">Leave a Review</span></Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="ticket__row">
      <span className="ticket__key">{label}</span>
      <span className="ticket__val">{value}</span>
    </div>
  )
}
