import type { Metadata } from 'next'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { createAdminClient, hasAdminSupabaseEnv } from '@/lib/supabase/server'
import { getSiteData } from '@/lib/site'
import { buildMenuPresentation } from '@/lib/menu'
import MenuPageClient from '@/components/menu/MenuPageClient'
import type { Database } from '@/types/database'
import { getPublicLang } from '@/lib/server-lang'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

export const metadata: Metadata = { title: 'Our Menu' }
export const dynamic = 'force-dynamic'

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
  ['menu_page_items'],
  { revalidate: 120 }
)

export default async function MenuPage() {
  const lang = await getPublicLang()
  const [items, site] = await Promise.all([getMenuItems(), getSiteData()])
  const { grouped, categories, labels } = buildMenuPresentation(items, site)

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="section-label" data-copy-en="What We Serve" data-copy-id="Apa yang Kami Sajikan">{lang === 'id' ? 'Apa yang Kami Sajikan' : 'What We Serve'}</div>
          <h1 data-copy-en="Our Menu" data-copy-id="Menu Kami">{lang === 'id' ? 'Menu Kami' : 'Our Menu'}</h1>
          <p data-copy-en="Carefully crafted drinks and bites to match any mood." data-copy-id="Minuman dan camilan yang diracik dengan hati untuk setiap suasana.">{lang === 'id' ? 'Minuman dan camilan yang diracik dengan hati untuk setiap suasana.' : 'Carefully crafted drinks and bites to match any mood.'}</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '64px 0', fontSize: '1rem' }} data-copy-en="Menu is being updated. Please check back again soon." data-copy-id="Menu sedang diperbarui. Silakan kembali lagi. 🍃">
              Menu is being updated. Please check back again soon.
            </p>
          ) : (
            <MenuPageClient categories={categories} grouped={grouped} labels={labels} />
          )}
        </div>
      </section>

      <section className="section--sm" style={{ background: 'var(--cream-dark)', borderTop: '1px solid var(--border)' }}>
        <div className="container text-center">
          <h3 style={{ marginBottom: 12 }} data-copy-en="See something you like?" data-copy-id="Ada yang kamu suka?">{lang === 'id' ? 'Ada yang kamu suka?' : 'See something you like?'}</h3>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }} data-copy-en="Order online and have it ready when you arrive." data-copy-id="Pesan online dan biarkan siap saat kamu tiba.">{lang === 'id' ? 'Pesan online dan biarkan siap saat kamu tiba.' : 'Order online and have it ready when you arrive.'}</p>
          <Link href="/order" className="btn btn--primary"><span data-copy-en="Order Now" data-copy-id="Pesan Sekarang">{lang === 'id' ? 'Pesan Sekarang' : 'Order Now'}</span></Link>
        </div>
      </section>
    </>
  )
}
