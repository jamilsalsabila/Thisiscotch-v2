import { redirect } from 'next/navigation'
import { requireAdminAccess } from '@/lib/admin-auth'

export default async function AdminWaitlist() {
  await requireAdminAccess()
  redirect('/admin/bookings?tab=waitlist')
}
