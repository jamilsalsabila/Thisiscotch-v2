import { redirect } from 'next/navigation'
import { requireAdminAccess } from '@/lib/admin-auth'

export default async function AdminOrders() {
  await requireAdminAccess()
  redirect('/admin/bookings?tab=orders')
}
