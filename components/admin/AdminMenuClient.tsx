'use client'

import { useMemo, useState } from 'react'
import { deleteMenuItem, deleteMenuItems, toggleMenuAvailable, toggleMenuFeatured } from '@/app/admin/actions'
import { formatRupiah } from '@/utils/format'
import MenuForm from '@/components/admin/MenuForm'
import type { Database } from '@/types/database'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type CategoryMap = Record<string, { label_en: string; label_id: string; subs: string[] }>
const NO_IMG_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='52'%3E%3Crect width='52' height='52' fill='%23f3f4f6'/%3E%3Ctext x='26' y='31' text-anchor='middle' font-size='20' font-family='sans-serif'%3E%E2%98%95%3C/text%3E%3C/svg%3E"

export default function AdminMenuClient({
  items,
  categories,
  labels,
  categoryMap,
}: {
  items: MenuItem[]
  categories: string[]
  labels: Record<string, string>
  categoryMap: CategoryMap
}) {
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<number[]>([])

  const grouped = useMemo(() => categories.map(category => ({
    category,
    items: items.filter(item => item.category === category),
  })), [categories, items])

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const visible = tab === 'all' ? grouped : grouped.filter(group => group.category === tab)
    return visible.map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (!normalized) return true
        const text = [item.name_en, item.name_id, item.subcategory, item.description_en ?? '', item.description_id ?? ''].join(' ').toLowerCase()
        return text.includes(normalized)
      }),
    })).filter(group => group.items.length > 0)
  }, [grouped, query, tab])

  const allVisibleItems = filteredGroups.flatMap(group => group.items)
  const allVisibleIds = allVisibleItems.map(item => item.id)
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selected.includes(id))

  function toggleSelected(id: number, checked: boolean) {
    setSelected(current => checked ? [...new Set([...current, id])] : current.filter(item => item !== id))
  }

  function toggleSelectAll() {
    setSelected(current => {
      if (allSelected) return current.filter(id => !allVisibleIds.includes(id))
      return [...new Set([...current, ...allVisibleIds])]
    })
  }

  return (
    <>
      <div className="admin-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="admin-page-title" style={{ marginBottom: 4 }}>Menu Management</div>
          <p style={{ fontSize: '.85rem', color: 'var(--a-muted)' }}>Manage menu items, pricing, availability, and featured labels.</p>
        </div>
        <MenuForm categories={categories.length ? categories : ['drink', 'food', 'pastry']} categoryMap={categoryMap} />
      </div>

      <div className="admin-filter-row" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          className="admin-inline-search"
          placeholder="Search items…"
        />
        <label className="a-btn a-btn--outline a-btn--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
          <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
          Pilih Semua
        </label>
      </div>

      <div className="tabs" style={{ marginBottom: 20, borderRadius: 20 }}>
        <button type="button" className={`tab-link${tab === 'all' ? ' active' : ''}`} onClick={() => setTab('all')} style={{ borderRadius: 20 }}>
          All <span className="a-badge a-badge--gray" style={{ marginLeft: 6 }}>{items.length}</span>
        </button>
        {grouped.map(group => (
          <button key={group.category} type="button" className={`tab-link${tab === group.category ? ' active' : ''}`} onClick={() => setTab(group.category)} style={{ borderRadius: 20 }}>
            {labels[group.category] ?? group.category} <span className="a-badge a-badge--gray" style={{ marginLeft: 6 }}>{group.items.length}</span>
          </button>
        ))}
      </div>

      {selected.length > 0 ? (
        <div className="admin-bulk-bar" style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#1A1714', color: '#fff', borderRadius: 10, padding: '12px 16px', marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ flex: 1, fontSize: '.875rem', fontWeight: 500 }}>{selected.length} item dipilih</span>
          <button type="button" className="a-btn a-btn--outline a-btn--sm" onClick={() => setSelected([])} style={{ color: 'rgba(255,255,255,.8)', borderColor: 'rgba(255,255,255,.25)' }}>Batal</button>
          <form action={async () => { await deleteMenuItems(selected) }}>
            <button className="a-btn a-btn--danger a-btn--sm" type="submit">Hapus yang Dipilih</button>
          </form>
        </div>
      ) : null}

      {filteredGroups.map(group => (
        <div key={group.category} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--a-muted)', padding: '0 2px 8px' }}>
            {labels[group.category] ?? group.category}
            <span className="a-badge a-badge--gray" style={{ fontSize: '.62rem' }}>{group.items.length}</span>
          </div>
          {group.items.map(item => (
            <div
              key={item.id}
              className="admin-menu-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: selected.includes(item.id) ? '#fff5f5' : '#fff',
                border: `1px solid ${selected.includes(item.id) ? 'var(--a-red)' : 'var(--a-border)'}`,
                borderRadius: 10,
                padding: '10px 12px',
                marginBottom: 6,
                opacity: item.is_available ? 1 : .72,
                boxShadow: selected.includes(item.id) ? '0 0 0 1px var(--a-red) inset' : undefined,
                flexWrap: 'wrap',
              }}
            >
              <input type="checkbox" checked={selected.includes(item.id)} onChange={event => toggleSelected(item.id, event.target.checked)} style={{ width: 17, height: 17, accentColor: 'var(--a-red)', cursor: 'pointer' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image || NO_IMG_SVG}
                alt={item.name_en || item.name_id}
                style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--a-border)', background: 'var(--a-bg)' }}
                onError={event => { event.currentTarget.src = NO_IMG_SVG }}
              />
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontWeight: 600, fontSize: '.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name_en || '—'}</div>
                <div style={{ fontSize: '.74rem', color: 'var(--a-muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name_id}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  <span className="a-badge a-badge--gray">{item.subcategory}</span>
                  <span style={{ fontWeight: 700, fontSize: '.8rem', color: '#92400e' }}>{formatRupiah(item.price)}</span>
                  {!item.is_available ? <span className="a-badge a-badge--red" style={{ fontSize: '.6rem' }}>Unavailable</span> : null}
                  {item.is_featured ? <span className="a-badge a-badge--gold" style={{ fontSize: '.6rem' }}>Featured</span> : null}
                </div>
              </div>
              <div className="admin-menu-toggles" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <form action={async () => { await toggleMenuAvailable(item.id, !item.is_available) }}>
                    <label className="a-toggle">
                      <input type="checkbox" checked={item.is_available} onChange={event => event.currentTarget.form?.requestSubmit()} />
                      <span className="a-toggle__slider" />
                    </label>
                  </form>
                  <span style={{ fontSize: '.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--a-muted)' }}>Available</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <form action={async () => { await toggleMenuFeatured(item.id, !item.is_featured) }}>
                    <label className="a-toggle">
                      <input type="checkbox" checked={item.is_featured} onChange={event => event.currentTarget.form?.requestSubmit()} />
                      <span className="a-toggle__slider" />
                    </label>
                  </form>
                  <span style={{ fontSize: '.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--a-muted)' }}>Featured</span>
                </div>
              </div>
              <div className="admin-menu-actions" style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                <MenuForm item={item} categories={categories.length ? categories : ['drink', 'food', 'pastry']} categoryMap={categoryMap} />
                <form action={async () => { await deleteMenuItem(item.id) }}>
                  <button className="a-btn a-btn--danger a-btn--xs" type="submit">✕</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ))}

      {filteredGroups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--a-muted)', fontSize: '.9rem' }}>
          <p style={{ marginBottom: 16 }}>Tidak ada item yang cocok dengan pencarian.</p>
        </div>
      ) : null}
    </>
  )
}
