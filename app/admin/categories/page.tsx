import Link from 'next/link'
import {
  addMenuCategory,
  addMenuSubcategory,
  deleteMenuCategory,
  deleteMenuSubcategory,
  updateMenuCategory,
} from '@/app/admin/actions'
import { requireAdminAccess } from '@/lib/admin-auth'
import { DEFAULT_MENU_CATEGORIES } from '@/lib/site'
import { createAdminClient } from '@/lib/supabase/server'

type CategoriesMap = Record<string, { label_en: string; label_id: string; subs: string[] }>

export default async function AdminCategoriesPage() {
  await requireAdminAccess()
  const supabase = createAdminClient()
  const [{ data: setting }, { data: menuItems }] = await Promise.all([
    (supabase.from('site_settings').select('value').eq('key', 'menu_categories').single() as any),
    (supabase.from('menu_items').select('category, subcategory') as any),
  ])

  let categories: CategoriesMap = DEFAULT_MENU_CATEGORIES

  try {
    if (setting?.value) {
      categories = {
        ...DEFAULT_MENU_CATEGORIES,
        ...(JSON.parse(setting.value) as CategoriesMap),
      }
    }
  } catch {}

  const categoryCounts = new Map<string, number>()
  const subCounts = new Map<string, number>()
  ;((menuItems as Array<{ category: string; subcategory: string }> | null) ?? []).forEach(item => {
    categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1)
    subCounts.set(`${item.category}:${item.subcategory}`, (subCounts.get(`${item.category}:${item.subcategory}`) ?? 0) + 1)
  })

  return (
    <>
      <div className="admin-toolbar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <Link href="/admin/menu" className="a-btn a-btn--outline a-btn--sm">← Menu</Link>
      </div>

      {Object.entries(categories).map(([slug, category]) => (
        <div key={slug} className="a-card">
          <div className="admin-category-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div className="admin-category-meta" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '1rem', fontWeight: 700 }}>{category.label_en}</span>
                <span style={{ color: 'var(--a-muted)', fontSize: '.82rem', marginLeft: 6 }}>/ {category.label_id}</span>
                <code style={{ fontSize: '.72rem', color: 'var(--a-muted)', marginLeft: 8, background: 'var(--a-bg)', padding: '2px 6px', borderRadius: 4 }}>{slug}</code>
              </div>
              <span className="a-badge a-badge--gray">{categoryCounts.get(slug) ?? 0} items</span>
            </div>
            <form action={async () => {
              'use server'
              await deleteMenuCategory(slug)
            }}>
              <button className="a-btn a-btn--danger a-btn--xs" type="submit">Delete</button>
            </form>
          </div>

          <form action={async (fd: FormData) => {
            'use server'
            await updateMenuCategory({
              oldSlug: slug,
              newSlug: String(fd.get('new_slug') ?? ''),
              label_en: String(fd.get('label_en') ?? ''),
              label_id: String(fd.get('label_id') ?? ''),
            })
          }}>
            <div className="a-grid-3" style={{ marginBottom: 16 }}>
              <div className="a-form-group">
                <label>Slug</label>
                <input className="a-input" name="new_slug" defaultValue={slug} />
              </div>
              <div className="a-form-group">
                <label>Label (English)</label>
                <input className="a-input" name="label_en" defaultValue={category.label_en} />
              </div>
              <div className="a-form-group">
                <label>Label (Indonesian)</label>
                <input className="a-input" name="label_id" defaultValue={category.label_id} />
              </div>
            </div>
            <button className="a-btn a-btn--outline a-btn--xs" type="submit">Save Labels</button>
          </form>

          <div className="admin-category-subs" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '16px 0' }}>
            {category.subs.map(sub => (
              <div
                key={sub}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--a-bg)',
                  border: '1px solid var(--a-border)',
                  borderRadius: 20,
                  padding: '4px 12px',
                  fontSize: '.82rem',
                }}
              >
                <span>{sub}</span>
                <span style={{ fontSize: '.7rem', color: 'var(--a-muted)' }}>({subCounts.get(`${slug}:${sub}`) ?? 0})</span>
                <form action={async () => {
                  'use server'
                  await deleteMenuSubcategory({ slug, sub })
                }}>
                  <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '.8rem', padding: 0, lineHeight: 1 }}>
                    ×
                  </button>
                </form>
              </div>
            ))}

            <form className="admin-category-sub-form" action={async (fd: FormData) => {
              'use server'
              await addMenuSubcategory({ slug, sub: String(fd.get('sub') ?? '') })
            }} style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
              <input className="a-input" name="sub" placeholder="+ new sub" style={{ width: 140, padding: '4px 10px', fontSize: '.82rem', borderRadius: 20 }} />
              <button className="a-btn a-btn--primary a-btn--xs" type="submit">Add</button>
            </form>
          </div>
        </div>
      ))}

      <div className="a-card">
        <h2>Add New Category</h2>
        <form action={async (fd: FormData) => {
          'use server'
          await addMenuCategory({
            slug: String(fd.get('slug') ?? ''),
            label_en: String(fd.get('label_en') ?? ''),
            label_id: String(fd.get('label_id') ?? ''),
          })
        }}>
          <div className="a-grid-2" style={{ maxWidth: 560 }}>
            <div className="a-form-group">
              <label>Slug</label>
              <input className="a-input" name="slug" placeholder="e.g. dessert" />
            </div>
            <div className="a-form-group">
              <label>Label (English)</label>
              <input className="a-input" name="label_en" placeholder="e.g. Dessert" />
            </div>
            <div className="a-form-group">
              <label>Label (Indonesian)</label>
              <input className="a-input" name="label_id" placeholder="e.g. Dessert" />
            </div>
          </div>
          <p style={{ fontSize: '.8rem', color: 'var(--a-muted)', marginBottom: 12 }}>
            Setelah category dibuat, tambahkan subcategory-nya dari card di atas.
          </p>
          <button className="a-btn a-btn--primary" type="submit">Add Category</button>
        </form>
      </div>
    </>
  )
}
