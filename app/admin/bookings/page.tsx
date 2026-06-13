import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdminAccess } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { updateBookingStatus, updateOrderStatus, updateWaitlistStatus } from '@/app/admin/actions'
import AdminActionForm from '@/components/admin/AdminActionForm'
import { formatRupiah, tableLabel } from '@/utils/format'

type SearchParams = Promise<{ tab?: string; q?: string; msg?: string }>

function bookingsPageUrl(tab: string, msg: string, q = '') {
  const params = new URLSearchParams()
  params.set('tab', tab)
  if (q) params.set('q', q)
  params.set('msg', msg)
  return `/admin/bookings?${params.toString()}`
}

export default async function AdminBookingsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminAccess()
  const { tab = 'bookings', q = '', msg = '' } = await searchParams
  const supabase = createAdminClient()

  const [{ data: bookings }, { data: waitlist }, { data: orders }, { data: floorTables }] = await Promise.all([
    (supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(100) as any),
    (supabase.from('waitlist').select('*').order('created_at', { ascending: false }).limit(100) as any),
    (supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100) as any),
    (supabase.from('floor_tables').select('*') as any),
  ])

  await (supabase.from('bookings') as any)
    .update({ is_seen: true })
    .eq('is_seen', false)

  const tableMap = new Map((((floorTables as any[]) ?? []).map(item => [item.id, item])))
  const bookingCount = ((bookings as any[]) ?? []).length
  const waitlistCount = ((waitlist as any[]) ?? []).length
  const orderCount = ((orders as any[]) ?? []).length

  const term = q.trim().toLowerCase()

  const bookingRows = ((((bookings as any[]) ?? []).map(item => {
    const table = tableMap.get(item.table_id)
    return {
      ...item,
      table_section: table?.section ?? null,
      capacity: table?.capacity ?? null,
    }
  })).filter(item => {
    if (!term) return true
    const labels = [item.booking_code, item.guest_name, item.table_id, tableLabel(item.table_id)].join(' ').toLowerCase()
    return labels.includes(term)
  }))

  const waitlistRows = (((waitlist as any[]) ?? []).filter(item => {
    if (!term) return true
    return [item.waitlist_code, item.guest_name].join(' ').toLowerCase().includes(term)
  }))

  const orderRows = (((orders as any[]) ?? []).filter(item => {
    if (!term) return true
    return [item.order_code, item.guest_name, item.table_number ?? ''].join(' ').toLowerCase().includes(term)
  }))

  return (
    <>
      {msg ? (
        <div className="a-alert a-alert--success" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          {msg}
        </div>
      ) : null}

      <div className="tabs">
        <Link href="/admin/bookings?tab=bookings" className={`tab-link${tab === 'bookings' ? ' active' : ''}`}>
          Bookings <span className="a-badge a-badge--red" style={{ marginLeft: 4 }}>{bookingCount}</span>
        </Link>
        <Link href="/admin/bookings?tab=orders" className={`tab-link${tab === 'orders' ? ' active' : ''}`}>
          Orders <span className="a-badge a-badge--gold" style={{ marginLeft: 4 }}>{orderCount}</span>
        </Link>
        <Link href="/admin/bookings?tab=waitlist" className={`tab-link${tab === 'waitlist' ? ' active' : ''}`}>
          Waitlist <span className="a-badge a-badge--gray" style={{ marginLeft: 4 }}>{waitlistCount}</span>
        </Link>
      </div>

      {tab !== 'orders' ? (
        <form style={{ marginBottom: 12 }}>
          <input type="hidden" name="tab" value={tab} />
          <input
            type="text"
            name="q"
            defaultValue={q}
            className="admin-inline-search"
            placeholder={tab === 'bookings' ? 'Search by table (e.g. AB), booking code, or guest name…' : 'Search by code or guest name…'}
          />
        </form>
      ) : null}

      {tab === 'bookings' && (
        <div className="a-card tab-panel">
          <div className="a-table-wrap">
            <table>
              <thead>
                <tr><th>Code</th><th>Guest</th><th>Phone</th><th>Table</th><th>Date</th><th>Time</th><th>Party</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {bookingRows.map(booking => (
                  <tr key={booking.id}>
                    <td><code style={{ fontSize: '.72rem' }}>{booking.booking_code}</code></td>
                    <td>{booking.guest_name}</td>
                    <td style={{ fontSize: '.8rem' }}>{booking.guest_phone}</td>
                    <td>
                      <span className="a-badge a-badge--gray">{tableLabel(booking.table_id)}</span>
                      {booking.table_section ? <small style={{ color: 'var(--a-muted)', marginLeft: 4 }}>({booking.table_section})</small> : null}
                    </td>
                    <td>{booking.booking_date}</td>
                    <td>{booking.booking_time}</td>
                    <td>{booking.party_size} pax</td>
                    <td><span className={`a-badge ${booking.status === 'active' ? 'a-badge--green' : 'a-badge--red'}`}>{booking.status}</span></td>
                    <td className="admin-booking-actions" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {booking.status === 'active' && (
                        <AdminActionForm
                          action={async () => {
                            'use server'
                            await updateBookingStatus(booking.id, 'cancelled')
                            redirect(bookingsPageUrl('bookings', 'Booking dibatalkan.', q))
                          }}
                          confirmMessage="Batalkan booking ini?"
                        >
                          <button type="submit" className="a-btn a-btn--danger a-btn--xs">Cancel</button>
                        </AdminActionForm>
                      )}
                    </td>
                  </tr>
                ))}
                {bookingRows.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--a-muted)', padding: 24 }}>No bookings yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="a-card tab-panel">
          <div className="a-table-wrap">
            <table>
              <thead>
                <tr><th>Code</th><th>Guest</th><th>Phone</th><th>Table</th><th>Total</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {orderRows.map(order => (
                  <tr key={order.id}>
                    <td><code style={{ fontSize: '.72rem' }}>{order.order_code}</code></td>
                    <td>{order.guest_name}</td>
                    <td style={{ fontSize: '.8rem' }}>{order.guest_phone}</td>
                    <td>{order.table_number || '—'}</td>
                    <td>{formatRupiah(Number(order.total_amount))}</td>
                    <td><span className={`a-badge ${order.status === 'cancelled' ? 'a-badge--red' : order.status === 'ready' ? 'a-badge--green' : order.status === 'confirmed' || order.status === 'preparing' ? 'a-badge--gold' : 'a-badge--gray'}`}>{order.status}</span></td>
                    <td>
                      {order.status !== 'cancelled' && (
                        <form className="admin-order-status-form" action={async (formData: FormData) => {
                          'use server'
                          await updateOrderStatus(order.id, String(formData.get('status') ?? 'pending'))
                          redirect(bookingsPageUrl('orders', 'Status order diperbarui.'))
                        }}>
                          <select
                            name="status"
                            className="a-select"
                            style={{ padding: '4px 8px', fontSize: '.75rem' }}
                            defaultValue={order.status}
                            onChange={e => e.currentTarget.form?.requestSubmit()}
                          >
                            {['pending', 'confirmed', 'preparing', 'ready', 'cancelled'].map(status => (
                              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                            ))}
                          </select>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
                {orderRows.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--a-muted)', padding: 24 }}>No orders yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'waitlist' && (
        <div className="a-card tab-panel">
          <div className="a-table-wrap">
            <table>
              <thead>
                <tr><th>Code</th><th>Guest</th><th>Phone</th><th>Pref. Date</th><th>Pref. Time</th><th>Party</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {waitlistRows.map(item => (
                  <tr key={item.id}>
                    <td><code style={{ fontSize: '.72rem' }}>{item.waitlist_code}</code></td>
                    <td>{item.guest_name}</td>
                    <td style={{ fontSize: '.8rem' }}>{item.guest_phone}</td>
                    <td>{item.preferred_date}</td>
                    <td>{item.preferred_time}</td>
                    <td>{item.party_size} pax</td>
                    <td><span className={`a-badge ${item.status === 'waiting' ? 'a-badge--gold' : item.status === 'notified' ? 'a-badge--green' : 'a-badge--red'}`}>{item.status}</span></td>
                    <td>
                      {item.status === 'waiting' && (
                        <AdminActionForm
                          action={async () => {
                            'use server'
                            await updateWaitlistStatus(item.id, 'cancelled')
                            redirect(bookingsPageUrl('waitlist', 'Waitlist dibatalkan.', q))
                          }}
                          confirmMessage="Batalkan waitlist ini?"
                        >
                          <button type="submit" className="a-btn a-btn--danger a-btn--xs">Cancel</button>
                        </AdminActionForm>
                      )}
                    </td>
                  </tr>
                ))}
                {waitlistRows.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--a-muted)', padding: 24 }}>No waitlist entries yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
