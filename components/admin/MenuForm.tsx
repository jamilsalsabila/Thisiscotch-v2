'use client'

import { useState } from 'react'
import { saveMenuItemForm } from '@/app/admin/actions'
import type { Database } from '@/types/database'
import { XMarkIcon } from '@heroicons/react/24/outline'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type CategoryMap = Record<string, { label_en: string; label_id: string; subs: string[] }>

export default function MenuForm({
  item,
  categories = ['drink', 'food', 'pastry'],
  categoryMap,
}: {
  item?: MenuItem
  categories?: string[]
  categoryMap: CategoryMap
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const isEdit = !!item
  const firstCategory = categories[0] ?? 'drink'

  const [form, setForm] = useState({
    name_id:       item?.name_id       ?? '',
    name_en:       item?.name_en       ?? '',
    description_id:item?.description_id ?? '',
    description_en:item?.description_en ?? '',
    category:      item?.category      ?? firstCategory,
    subcategory:   item?.subcategory   ?? (categoryMap[firstCategory]?.subs[0] ?? 'coffee'),
    price:         item?.price         ?? 0,
    is_available:  item?.is_available  ?? true,
    is_featured:   item?.is_featured   ?? false,
    sort_order:    item?.sort_order    ?? 0,
    image_url:     item?.image         ?? '',
  })

  function set(f: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(v => {
        const value = e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.type === 'number'
            ? Number(e.target.value)
            : e.target.value
        if (f === 'category') {
          const nextCategory = String(value)
          return {
            ...v,
            category: nextCategory,
            subcategory: categoryMap[nextCategory]?.subs.includes(v.subcategory) ? v.subcategory : (categoryMap[nextCategory]?.subs[0] ?? ''),
          }
        }
        return { ...v, [f]: value }
      })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    if (item?.id) formData.set('id', String(item.id))
    await saveMenuItemForm(formData)
    setSaving(false)
    setOpen(false)
    setUploadPreview(null)
  }

  function handleFilePreview(file: File | null) {
    if (!file) {
      setUploadPreview(null)
      return
    }
    const reader = new FileReader()
    reader.onload = event => setUploadPreview(String(event.target?.result ?? ''))
    reader.readAsDataURL(file)
  }

  return (
    <>
      <button
        className={isEdit ? 'a-btn a-btn--outline a-btn--xs' : 'a-btn a-btn--primary'}
        onClick={() => setOpen(true)}
      >
        {isEdit ? 'Edit' : '+ Add Item'}
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>{isEdit ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex' }}><XMarkIcon style={{ width: 20, height: 20 }} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="a-grid-2">
                <div className="a-form-group">
                  <label>Name (English)</label>
                  <input className="a-input" required value={form.name_en} onChange={set('name_en')} placeholder="e.g. Caffe Latte" />
                </div>
                <div className="a-form-group">
                  <label>Name (Indonesian)</label>
                  <input className="a-input" required value={form.name_id} onChange={set('name_id')} placeholder="e.g. Kafe Latte" />
                </div>
              </div>

              <div className="a-grid-2">
                <div className="a-form-group">
                  <label>Description (EN)</label>
                  <input className="a-input" value={form.description_en} onChange={set('description_en')} placeholder="Short description" />
                </div>
                <div className="a-form-group">
                  <label>Description (ID)</label>
                  <input className="a-input" value={form.description_id} onChange={set('description_id')} placeholder="Deskripsi singkat" />
                </div>
              </div>

              <div className="a-grid-3">
                <div className="a-form-group">
                  <label>Category</label>
                  <select className="a-select" value={form.category} onChange={set('category')}>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {categoryMap[category]?.label_en ?? category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="a-form-group">
                  <label>Subcategory</label>
                  <select className="a-select" value={form.subcategory} onChange={set('subcategory')}>
                    {(categoryMap[form.category]?.subs ?? []).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div className="a-form-group">
                  <label>Price (Rp)</label>
                  <input className="a-input" required type="number" min={0} value={form.price} onChange={set('price')} />
                </div>
              </div>

              <div className="a-grid-2">
                <div className="a-form-group">
                  <label>Foto <span style={{ fontWeight: 400, color: 'var(--a-muted)' }}>(JPG/PNG/WebP/GIF)</span></label>
                  <input className="a-input" type="file" name="image" accept="image/*" onChange={event => handleFilePreview(event.target.files?.[0] ?? null)} />
                  {uploadPreview ? (
                    <div className="admin-upload-preview" style={{ marginTop: 8 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={uploadPreview} alt="Menu preview" />
                    </div>
                  ) : item?.image ? (
                    <div className="admin-upload-preview" style={{ marginTop: 8 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name_en} />
                    </div>
                  ) : null}
                </div>
                <div className="a-form-group">
                  <label>Image URL</label>
                  <input className="a-input" name="image_url" value={form.image_url} onChange={set('image_url')} placeholder="atau URL gambar: https://..." />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20, marginBottom: 20, marginTop: 4, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.875rem', cursor: 'pointer' }}>
                  <input type="checkbox" name="is_available" checked={form.is_available} onChange={set('is_available')} />
                  Available
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.875rem', cursor: 'pointer' }}>
                  <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={set('is_featured')} />
                  Featured
                </label>
              </div>

              <input type="hidden" name="name_id" value={form.name_id} />
              <input type="hidden" name="name_en" value={form.name_en} />
              <input type="hidden" name="description_id" value={form.description_id} />
              <input type="hidden" name="description_en" value={form.description_en} />
              <input type="hidden" name="category" value={form.category} />
              <input type="hidden" name="subcategory" value={form.subcategory} />
              <input type="hidden" name="price" value={String(form.price)} />
              <input type="hidden" name="sort_order" value={String(form.sort_order)} />

              <button type="submit" className={`a-btn a-btn--primary${saving ? ' btn--loading' : ''}`} style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
                {saving ? '' : isEdit ? 'Save Changes' : 'Add Menu Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
