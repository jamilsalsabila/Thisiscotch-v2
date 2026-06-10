'use client'

import { useMemo, useState } from 'react'
import { deleteGalleryItem, deleteGalleryItems, moveGalleryItem, toggleGalleryActive } from '@/app/admin/actions'

type GalleryItem = {
  id: number
  src: string
  alt_id: string
  alt_en: string
  section: string
  sort_order: number
  is_active: boolean
}

export default function AdminGalleryClient({ items }: { items: GalleryItem[] }) {
  const [selected, setSelected] = useState<number[]>([])
  const allSelected = items.length > 0 && selected.length === items.length

  const selectedSet = useMemo(() => new Set(selected), [selected])

  function toggleOne(id: number, checked: boolean) {
    setSelected(current => checked ? [...current, id] : current.filter(item => item !== id))
  }

  function toggleAll() {
    setSelected(allSelected ? [] : items.map(item => item.id))
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Current Photos ({items.length})</h2>
        {items.length > 0 ? (
          <button type="button" className="a-btn a-btn--outline a-btn--sm" onClick={toggleAll}>
            {allSelected ? 'Batal Semua' : 'Pilih Semua'}
          </button>
        ) : null}
      </div>

      {selected.length > 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 16px', marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '.85rem', fontWeight: 600, color: '#dc2626' }}>{selected.length} foto dipilih</span>
          <form action={async () => { await deleteGalleryItems(selected) }}>
            <button className="a-btn a-btn--danger a-btn--sm" type="submit">Hapus yang Dipilih</button>
          </form>
          <button type="button" className="a-btn a-btn--outline a-btn--sm" onClick={() => setSelected([])}>Batal</button>
        </div>
      ) : null}

      <div className="a-gallery-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {items.map(item => (
          <div key={item.id} className="a-gallery-item" style={{ position: 'relative', opacity: item.is_active ? 1 : .45, filter: item.is_active ? 'none' : 'grayscale(.4)' }}>
            <label style={{ position: 'absolute', top: 6, right: 6, zIndex: 3, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedSet.has(item.id)}
                onChange={event => toggleOne(item.id, event.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#dc2626', cursor: 'pointer' }}
              />
            </label>

            {!item.is_active ? (
              <div style={{ position: 'absolute', top: 6, left: 6, zIndex: 2, background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: '.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>
                UNPUBLISHED
              </div>
            ) : null}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.src} alt={item.alt_id} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
            <div className="a-gallery-item__info">
              <div style={{ fontSize: '.82rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.alt_en || item.alt_id || 'Untitled'}
              </div>
              <div className="a-gallery-item__section">{item.section === 'outdoor' ? 'Semi-Outdoor' : 'Indoor'}</div>
              <div className="a-gallery-item__actions">
                <form action={async () => { await toggleGalleryActive(item.id, !item.is_active) }}>
                  <button className={`a-btn a-btn--xs ${item.is_active ? 'a-btn--outline' : 'a-btn--success'}`} type="submit">
                    {item.is_active ? 'Unpublish' : 'Publish'}
                  </button>
                </form>
                <form action={async () => { await moveGalleryItem(item.id, 'up') }}>
                  <button className="a-btn a-btn--outline a-btn--xs" type="submit" title="Move up">↑</button>
                </form>
                <form action={async () => { await moveGalleryItem(item.id, 'down') }}>
                  <button className="a-btn a-btn--outline a-btn--xs" type="submit" title="Move down">↓</button>
                </form>
                <form action={async () => { await deleteGalleryItem(item.id) }}>
                  <button className="a-btn a-btn--danger a-btn--xs" type="submit">✕</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
