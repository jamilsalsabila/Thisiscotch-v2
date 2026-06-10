import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { createAdminClient, hasAdminSupabaseEnv } from '@/lib/supabase/server'
import { getSiteData } from '@/lib/site'
import { buildMenuPresentation, type MenuItem } from '@/lib/menu'
import OrderClient from '@/components/order/OrderClient'
import LegacyIcon from '@/components/ui/LegacyIcon'

export const metadata: Metadata = { title: 'Order Online' }

const getMenuItems = unstable_cache(
  async (): Promise<MenuItem[]> => {
    if (!hasAdminSupabaseEnv()) return []
    const supabase = createAdminClient()
    const { data } = await (supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('category')
      .order('sort_order') as any)
    return (data as MenuItem[] | null) ?? []
  },
  ['menu_items'],
  { revalidate: 120 }
)

export default async function OrderPage() {
  const [items, site] = await Promise.all([getMenuItems(), getSiteData()])
  const { grouped, categories, labels } = buildMenuPresentation(items, site)
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="section-label" data-copy-en="Order" data-copy-id="Order">Order</div>
          <h1 data-copy-en="Order Online" data-copy-id="Order Online">Order Online</h1>
          <p data-copy-en="Order from your table or ahead of your visit." data-copy-id="Order langsung dari meja Anda atau sebelum Anda datang.">Order from your table or ahead of your visit.</p>
        </div>
      </div>
      {!site.isOpen ? (
        <div className="container" style={{ marginTop: 24 }}>
          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', color: '#78350f', borderRadius: 'var(--radius-sm)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, fontSize: '.9rem' }}>
            <span style={{ color: '#78350f', display: 'inline-flex' }}>
              <LegacyIcon name="moon" size={20} />
            </span>
            <div>
              <strong data-copy-en="Cafe is closed." data-copy-id="Cafe sedang tutup.">Cafe is closed.</strong>{' '}
              <span data-copy-en={`You can still browse the menu, but new orders are only available during opening hours (${site.openTime}–${site.closeTime}).`} data-copy-id={`Anda masih bisa lihat-lihat menu, tapi order baru bisa dilakukan saat jam operasional (${site.openTime}–${site.closeTime}).`}>
                You can still browse the menu, but new orders are only available during opening hours ({site.openTime}–{site.closeTime}).
              </span>
            </div>
          </div>
        </div>
      ) : null}
      <section className="section">
        <div className="container">
          <OrderClient categories={categories} grouped={grouped} labels={labels} isOpen={site.isOpen} />
        </div>
      </section>
    </>
  )
}
