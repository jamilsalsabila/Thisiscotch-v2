'use client'

import { useState } from 'react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

type GalleryItem = {
  id: number
  src: string
  alt_id: string
  section: string
}

const SIZES = ['tall', '', 'wide', '', 'tall', 'wide', '', '']

export default function GallerySection({ items }: { items: GalleryItem[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
        <p>Foto akan segera hadir.</p>
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
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.src} alt={item.alt_id} loading="lazy" />
            <div className="gallery-item__overlay">
              <span className="gallery-item__label">{item.section}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {current && (
        <div className="lightbox active" onClick={() => setLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="lightbox__img" src={current.src} alt={current.alt_id} onClick={e => e.stopPropagation()} />
          <button className="lightbox__close" onClick={() => setLightbox(null)}><XMarkIcon style={{ width: 22, height: 22 }} /></button>
          {lightbox! > 0 && (
            <button className="lightbox__nav lightbox__nav--prev" onClick={e => { e.stopPropagation(); setLightbox(l => l! - 1) }}><ChevronLeftIcon style={{ width: 28, height: 28 }} /></button>
          )}
          {lightbox! < items.length - 1 && (
            <button className="lightbox__nav lightbox__nav--next" onClick={e => { e.stopPropagation(); setLightbox(l => l! + 1) }}><ChevronRightIcon style={{ width: 28, height: 28 }} /></button>
          )}
        </div>
      )}
    </>
  )
}
