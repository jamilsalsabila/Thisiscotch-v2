import Link from 'next/link'
import { requireAdminAccess } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/utils/format'
import LegacyIcon from '@/components/ui/LegacyIcon'

export default async function AdminDashboard() {
  await requireAdminAccess()
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const [
    { count: bookingsToday },
    { count: ordersToday },
    { count: waitlistActive },
    { count: menuItems },
    visitorsTodayResult,
    visitorsTotalResult,
    { count: reviewsPending },
    { data: publishedReviews },
    { data: recentBookings },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'active').gte('created_at', `${today}T00:00:00`).lt('created_at', `${today}T23:59:59`),
    supabase.from('orders').select('*', { count: 'exact', head: true }).neq('status', 'cancelled').gte('created_at', `${today}T00:00:00`).lt('created_at', `${today}T23:59:59`),
    supabase.from('waitlist').select('*', { count: 'exact', head: true }).eq('status', 'waiting'),
    supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('is_available', true),
    (supabase.from('visitors' as any).select('count').eq('visit_date', today).maybeSingle() as any).catch?.(() => null) ?? Promise.resolve(null),
    (supabase.from('visitors' as any).select('count') as any).catch?.(() => null) ?? Promise.resolve(null),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_published', false),
    supabase.from('reviews').select('overall_rating').eq('is_published', true),
    supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(6),
  ])

  const visitorsToday = typeof visitorsTodayResult?.data?.count === 'number' ? visitorsTodayResult.data.count : null
  const visitorsTotal = Array.isArray(visitorsTotalResult?.data)
    ? visitorsTotalResult.data.reduce((sum: number, row: any) => sum + Number(row.count ?? 0), 0)
    : null

  const reviewsAvg = (publishedReviews ?? []).length
    ? ((publishedReviews ?? []).reduce((sum, row: any) => sum + Number(row.overall_rating ?? 0), 0) / (publishedReviews ?? []).length).toFixed(1)
    : null

  const quickLinks = [
    ['Menu', '/admin/menu', 'squares-2x2'],
    ['Schedule', '/admin/schedule', 'clock'],
    ['Gallery', '/admin/gallery', 'photo'],
    ['Settings', '/admin/settings', 'cog'],
    ['Bookings', '/admin/bookings', 'clipboard-list'],
    ['Reviews', '/admin/reviews', 'star'],
  ] as const

  return (
    <>
      <div className="a-stats">
        <div className="a-stat a-stat--red">
          <div className="a-stat__label">Bookings Today</div>
          <div className="a-stat__val">{bookingsToday ?? 0}</div>
          <div className="a-stat__sub">Active reservations</div>
        </div>
        <div className="a-stat a-stat--gold">
          <div className="a-stat__label">Orders Today</div>
          <div className="a-stat__val">{ordersToday ?? 0}</div>
          <div className="a-stat__sub">Not cancelled</div>
        </div>
        <div className="a-stat">
          <div className="a-stat__label">Waitlist</div>
          <div className="a-stat__val">{waitlistActive ?? 0}</div>
          <div className="a-stat__sub">Waiting</div>
        </div>
        <div className="a-stat a-stat--green">
          <div className="a-stat__label">Menu Items</div>
          <div className="a-stat__val">{menuItems ?? 0}</div>
          <div className="a-stat__sub">Available</div>
        </div>
        <div className="a-stat">
          <div className="a-stat__label">Visitors Today</div>
          <div className="a-stat__val">{visitorsToday !== null ? visitorsToday.toLocaleString('id-ID') : '—'}</div>
          <div className="a-stat__sub">Total: {visitorsTotal !== null ? visitorsTotal.toLocaleString('id-ID') : '—'}</div>
        </div>
        <Link href="/admin/reviews?tab=pending" className="a-stat" style={{ textDecoration: 'none', color: 'inherit', borderLeft: (reviewsPending ?? 0) > 0 ? '3px solid #d4941a' : undefined }}>
          <div className="a-stat__label">Pending Reviews</div>
          <div className="a-stat__val">{reviewsPending ?? 0}</div>
          <div className="a-stat__sub">{reviewsAvg ? `★ ${reviewsAvg} avg` : 'No reviews yet'}</div>
        </Link>
      </div>

      <div className="admin-quick-links" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12, marginBottom: 28 }}>
        {quickLinks.map(([label, href, icon]) => (
          <Link key={href} href={href} className="a-card admin-quick-link" style={{ display: 'flex', alignItems: 'center', gap: 12, margin: 0, textDecoration: 'none', transition: '.15s' }}>
            <span style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--a-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--a-red)' }}>
              <LegacyIcon name={icon} size={20} />
            </span>
            <span style={{ fontWeight: 600, color: 'var(--a-text)' }}>{label}</span>
          </Link>
        ))}
      </div>

      <div className="admin-split-grid">
        <div className="a-card">
          <h2>Recent Bookings</h2>
          <div className="a-table-wrap">
            <table>
              <thead><tr><th>Code</th><th>Guest</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {recentBookings?.map((booking: any) => (
                  <tr key={booking.id}>
                    <td><code style={{ fontSize: '.78rem' }}>{booking.booking_code}</code></td>
                    <td>{booking.guest_name}</td>
                    <td style={{ fontSize: '.78rem' }}>{booking.booking_date}</td>
                    <td><span className={`a-badge ${booking.status === 'active' ? 'a-badge--green' : 'a-badge--red'}`}>{booking.status}</span></td>
                  </tr>
                ))}
                {(!recentBookings || recentBookings.length === 0) && <tr><td colSpan={4} style={{ color: '#9ca3af', textAlign: 'center', padding: 20 }}>No bookings yet</td></tr>}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12 }}><Link href="/admin/bookings" className="a-btn a-btn--outline a-btn--sm">View All →</Link></div>
        </div>

        <div className="a-card">
          <h2>Recent Orders</h2>
          <div className="a-table-wrap">
            <table>
              <thead><tr><th>Code</th><th>Guest</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {recentOrders?.map((order: any) => (
                  <tr key={order.id}>
                    <td><code style={{ fontSize: '.78rem' }}>{order.order_code}</code></td>
                    <td>{order.guest_name}</td>
                    <td style={{ fontSize: '.82rem' }}>{formatRupiah(Number(order.total_amount))}</td>
                    <td><span className={`a-badge ${order.status === 'cancelled' ? 'a-badge--red' : order.status === 'ready' ? 'a-badge--green' : 'a-badge--gold'}`}>{order.status}</span></td>
                  </tr>
                ))}
                {(!recentOrders || recentOrders.length === 0) && <tr><td colSpan={4} style={{ color: '#9ca3af', textAlign: 'center', padding: 20 }}>No orders yet</td></tr>}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12 }}><Link href="/admin/bookings?tab=orders" className="a-btn a-btn--outline a-btn--sm">View All →</Link></div>
        </div>
      </div>
    </>
  )
}
