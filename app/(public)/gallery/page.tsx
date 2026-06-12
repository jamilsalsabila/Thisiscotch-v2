import { createAdminClient, hasAdminSupabaseEnv } from '@/lib/supabase/server'
import GalleryPageClient from '@/components/gallery/GalleryPageClient'

export const metadata = { title: 'Gallery — Cotch' }
export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  if (!hasAdminSupabaseEnv()) {
    return (
      <>
        <div className="page-hero">
          <div className="container">
            <div className="section-label" data-copy-en="Photos" data-copy-id="Foto">Photos</div>
            <h1 data-copy-en="Inside Cotch" data-copy-id="Di Dalam Cotch">Inside Cotch</h1>
            <p data-copy-en="Spaces designed to make you feel at home — inside and out." data-copy-id="Ruang yang dirancang agar kamu merasa betah — di dalam maupun di luar.">Spaces designed to make you feel at home — inside and out.</p>
          </div>
        </div>
        <section className="section">
          <div className="container">
            <GalleryPageClient items={[]} />
          </div>
        </section>
      </>
    )
  }

  const supabase = createAdminClient()
  const { data: items } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="section-label" data-copy-en="Photos" data-copy-id="Foto">Photos</div>
          <h1 data-copy-en="Inside Cotch" data-copy-id="Di Dalam Cotch">Inside Cotch</h1>
          <p data-copy-en="Spaces designed to make you feel at home — inside and out." data-copy-id="Ruang yang dirancang agar kamu merasa betah — di dalam maupun di luar.">Spaces designed to make you feel at home — inside and out.</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <GalleryPageClient items={items ?? []} />
        </div>
      </section>
    </>
  )
}
