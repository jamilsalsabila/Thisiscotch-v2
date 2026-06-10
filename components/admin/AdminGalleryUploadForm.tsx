'use client'

import { useRef, useState } from 'react'
import { saveGalleryItemsForm } from '@/app/admin/actions'

export default function AdminGalleryUploadForm({ nextSortOrder }: { nextSortOrder: number }) {
  const formRef = useRef<HTMLFormElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const [previews, setPreviews] = useState<Array<{ name: string; src: string }>>([])
  const [saving, setSaving] = useState(false)

  function applyFiles(files: FileList | File[] | null) {
    if (!files || files.length === 0) {
      setPreviews([])
      return
    }
    Promise.all(Array.from(files).map(file => new Promise<{ name: string; src: string }>(resolve => {
      const reader = new FileReader()
      reader.onload = event => resolve({ name: file.name, src: String(event.target?.result ?? '') })
      reader.readAsDataURL(file)
    }))).then(setPreviews)
  }

  return (
    <form
      ref={formRef}
      action={async (fd: FormData) => {
        setSaving(true)
        try {
          await saveGalleryItemsForm(fd)
          formRef.current?.reset()
          setPreviews([])
        } finally {
          setSaving(false)
        }
      }}
      className="a-grid-3"
    >
      <div className="a-form-group" style={{ gridColumn: '1 / -1' }}>
        <label>Upload Photo <span style={{ fontWeight: 400, color: 'var(--a-muted)' }}>(JPG, PNG, WebP, GIF — maks 5 MB per file)</span></label>
        <div
          className={`admin-upload-drop${dragging ? ' is-dragging' : ''}`}
          onDragEnter={event => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragOver={event => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={event => {
            event.preventDefault()
            setDragging(false)
          }}
          onDrop={event => {
            event.preventDefault()
            setDragging(false)
            const files = event.dataTransfer.files
            if (!fileRef.current || !files.length) return
            const transfer = new DataTransfer()
            Array.from(files).forEach(file => transfer.items.add(file))
            fileRef.current.files = transfer.files
            applyFiles(files)
          }}
        >
          <input
            ref={fileRef}
            className="a-input"
            type="file"
            name="images"
            accept="image/*"
            multiple
            onChange={event => applyFiles(event.target.files)}
          />
          <div className="admin-upload-drop__title">Drag &amp; drop atau klik untuk memilih</div>
          <div className="admin-upload-drop__sub">Bisa pilih beberapa foto sekaligus · Disimpan ke /assets/images/gallery/</div>
          {previews.length ? <div className="admin-upload-drop__file">{previews.length} file dipilih</div> : null}
        </div>
        {previews.length ? (
          <div className="admin-upload-preview">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {previews.map(preview => (
                <div key={preview.name} style={{ width: 110 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview.src} alt={preview.name} />
                  <div style={{ fontSize: '.7rem', color: 'var(--a-muted)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preview.name}</div>
                </div>
              ))}
            </div>
            <button type="button" className="a-btn a-btn--outline a-btn--xs" style={{ marginTop: 8 }} onClick={() => {
              formRef.current?.reset()
              setPreviews([])
            }}>
              ✕ Hapus Semua
            </button>
          </div>
        ) : null}
      </div>

      <div style={{ gridColumn: '1 / -1', textAlign: 'center', position: 'relative', margin: '2px 0 4px', fontSize: '.78rem', color: 'var(--a-muted)' }}>
        <span style={{ background: 'var(--a-white)', padding: '0 10px', position: 'relative', zIndex: 1 }}>atau masukkan URL gambar eksternal</span>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'var(--a-border)' }} />
      </div>

      <div className="a-form-group" style={{ gridColumn: '1 / -1' }}>
        <label />
        <input className="a-input" name="src" />
      </div>
      <div className="a-form-group">
        <label>Alt Text (English)</label>
        <input className="a-input" name="alt_en" placeholder="Cozy indoor seating area" />
      </div>
      <div className="a-form-group">
        <label>Alt Text (Indonesian)</label>
        <input className="a-input" name="alt_id" placeholder="Area duduk indoor yang nyaman" />
      </div>
      <div className="a-form-group" style={{ gridColumn: '1 / -1', maxWidth: 280 }}>
        <label>Section</label>
        <select className="a-select" name="section" defaultValue="indoor">
          <option value="indoor">Indoor</option>
          <option value="outdoor">Semi-Outdoor</option>
        </select>
      </div>
      <input type="hidden" name="sort_order" value={nextSortOrder} />
      <input type="hidden" name="is_active" value="on" />
      <div className="a-form-group" style={{ gridColumn: '1 / -1' }}>
        <button className={`a-btn a-btn--primary${saving ? ' btn--loading' : ''}`} type="submit" disabled={saving}>
          {saving ? '' : 'Add Photo'}
        </button>
      </div>
    </form>
  )
}
