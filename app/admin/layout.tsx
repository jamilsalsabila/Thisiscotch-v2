import '@/styles/admin.css'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { getSiteData } from '@/lib/site'
import AdminShell from '@/components/admin/AdminShell'

export const metadata: Metadata = { title: { default: 'Admin — Cotch', template: '%s — Admin Cotch' } }
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createAdminClient()
  const [{ count: unseenBookings }, site] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('is_seen', false).eq('status', 'active'),
    getSiteData(),
  ])

  return (
    <AdminShell unseenBookings={unseenBookings ?? 0} isOpen={site.isOpen}>
      {children}
    </AdminShell>
  )
}
