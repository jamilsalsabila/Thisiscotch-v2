import Link from 'next/link'
import { requireAdminAccess } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import AdminGalleryClient from '@/components/admin/AdminGalleryClient'
import AdminGalleryUploadForm from '@/components/admin/AdminGalleryUploadForm'

export default async function AdminGalleryPage() {
  await requireAdminAccess()
  const supabase = createAdminClient()
  const { data: items } = await (supabase.from('gallery_items').select('*').order('sort_order').order('id') as any)
  const gallery = (items as Array<{
    id: number
    src: string
    alt_id: string
    alt_en: string
    section: string
    sort_order: number
    is_active: boolean
  }> | null) ?? []

  return (
    <>
      <div className="a-card">
        <h2>Add New Photo</h2>
        <AdminGalleryUploadForm nextSortOrder={gallery.length + 1} />
      </div>

      <div className="a-card">
        <div className="admin-gallery-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Link href="/gallery" target="_blank" className="a-btn a-btn--outline a-btn--sm">View Gallery ↗</Link>
        </div>
        <AdminGalleryClient items={gallery} />
      </div>
    </>
  )
}
