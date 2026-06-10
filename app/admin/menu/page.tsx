import { requireAdminAccess } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { getSiteData } from '@/lib/site'
import AdminMenuClient from '@/components/admin/AdminMenuClient'

export default async function AdminMenu() {
  await requireAdminAccess()
  const sb = createAdminClient()
  const [{ data: items }, site] = await Promise.all([
    sb.from('menu_items').select('*').order('category').order('created_at', { ascending: false }).order('id', { ascending: false }),
    getSiteData(),
  ])

  const categories = [...new Set((items?.map(i => i.category) ?? []) as string[])] as string[]
  const labels = Object.fromEntries(categories.map(category => [category, site.menuCategories[category]?.label_en ?? category]))

  return (
    <AdminMenuClient items={(items as any[]) ?? []} categories={categories} labels={labels} categoryMap={site.menuCategories} />
  )
}
