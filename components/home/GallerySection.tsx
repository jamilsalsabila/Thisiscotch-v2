'use client'

import { useEffect, useState } from 'react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

type GalleryItem = {
  id: number
  src: string
  alt_id: string
  alt_en?: string
  section: string
}

const SIZES = ['tall', '', 'wide', '', 'tall', 'wide', '', '']

export default function GallerySection({ items }: { items: GalleryItem[] }) {
  const [lang, setLang] = useState<'en' | 'id'>('en')
  const [lightbox, setLightbox] = useState<number | null>(null)

  useEffect(() => {
    const applyLang = (value?: string) => setLang(value === 'id' ? 'id' : 'en')

    applyLang(localStorage.getItem('cotch_lang') || 'en')

    const onLangChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ lang?: string } | string>).detail
      if (typeof detail === 'string') {
        applyLang(detail)
        return
      }
      applyLang(detail?.lang || localStorage.getItem('cotch_lang') || 'en')
    }

    document.addEventListener('langChanged', onLangChanged)
    return () => document.removeEventListener('langChanged', onLangChanged)
  }, [])

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
        <p data-copy-en="Photos will be available soon." data-copy-id="Foto akan segera hadir.">Foto akan segera hadir.</p>
      </div>
    )
  }

  const current = lightbox !== null ? items[lightbox] : null

  return (
    <>
      <div className="gallery-grid">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`gallery-item${SIZES[i % SIZES.length] ? ' ' + SIZES[i % SIZES.length] : ''}`}
            onClick={() => setLightbox(i)}
            role="button"
            tabIndex={0}
            aria-label={lang === 'id' ? `Buka foto ${item.alt_id}` : `Open photo ${(item.alt_en || item.alt_id)}`}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setLightbox(i)
              }
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.src} alt={lang === 'id' ? item.alt_id : (item.alt_en || item.alt_id)} loading="lazy" />
            <div className="gallery-item__overlay">
              <span className="gallery-item__label">{item.section === 'outdoor' ? 'Semi-Outdoor' : 'Indoor'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {current && (
        <div className="lightbox active" onClick={() => setLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="lightbox__img" src={current.src} alt={lang === 'id' ? current.alt_id : (current.alt_en || current.alt_id)} onClick={e => e.stopPropagation()} />
          <button className="lightbox__close" onClick={() => setLightbox(null)} aria-label={lang === 'id' ? 'Tutup galeri' : 'Close gallery'}><XMarkIcon style={{ width: 22, height: 22 }} /></button>
          {lightbox! > 0 && (
            <button className="lightbox__nav lightbox__nav--prev" onClick={e => { e.stopPropagation(); setLightbox(l => l! - 1) }} aria-label={lang === 'id' ? 'Foto sebelumnya' : 'Previous photo'}><ChevronLeftIcon style={{ width: 28, height: 28 }} /></button>
          )}
          {lightbox! < items.length - 1 && (
            <button className="lightbox__nav lightbox__nav--next" onClick={e => { e.stopPropagation(); setLightbox(l => l! + 1) }} aria-label={lang === 'id' ? 'Foto berikutnya' : 'Next photo'}><ChevronRightIcon style={{ width: 28, height: 28 }} /></button>
          )}
        </div>
      )}
    </>
  )
}
