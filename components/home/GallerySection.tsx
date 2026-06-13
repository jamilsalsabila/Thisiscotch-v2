'use client'

import { useEffect, useRef, useState } from 'react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { usePublicLanguage } from '@/components/layout/PublicLanguageProvider'

type GalleryItem = {
  id: number
  src: string
  alt_id: string
  alt_en?: string
  section: string
}

const SIZES = ['tall', '', 'wide', '', 'tall', 'wide', '', '']

export default function GallerySection({ items }: { items: GalleryItem[] }) {
  const lang = usePublicLanguage()
  const [lightbox, setLightbox] = useState<number | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    if (lightbox === null) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightbox(null)
        return
      }

      if (event.key === 'ArrowLeft') {
        setLightbox(current => (current !== null && current > 0 ? current - 1 : current))
        return
      }

      if (event.key === 'ArrowRight') {
        setLightbox(current => (current !== null && current < items.length - 1 ? current + 1 : current))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [items.length, lightbox])

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
        <p data-copy-en="Photos will be available soon." data-copy-id="Foto akan segera hadir.">Foto akan segera hadir.</p>
      </div>
    )
  }

  const current = lightbox !== null ? items[lightbox] : null

  function movePrev() {
    setLightbox(currentIndex => (currentIndex !== null && currentIndex > 0 ? currentIndex - 1 : currentIndex))
  }

  function moveNext() {
    setLightbox(currentIndex => (currentIndex !== null && currentIndex < items.length - 1 ? currentIndex + 1 : currentIndex))
  }

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
        <div
          className="lightbox active"
          onClick={() => setLightbox(null)}
          onTouchStart={event => {
            const touch = event.touches[0]
            touchStartX.current = touch.clientX
            touchStartY.current = touch.clientY
          }}
          onTouchEnd={event => {
            if (touchStartX.current === null || touchStartY.current === null) return
            const touch = event.changedTouches[0]
            const deltaX = touch.clientX - touchStartX.current
            const deltaY = touch.clientY - touchStartY.current
            touchStartX.current = null
            touchStartY.current = null

            if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return
            if (deltaX > 0) {
              movePrev()
            } else {
              moveNext()
            }
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="lightbox__img" src={current.src} alt={lang === 'id' ? current.alt_id : (current.alt_en || current.alt_id)} onClick={e => e.stopPropagation()} />
          <button className="lightbox__close" onClick={() => setLightbox(null)} aria-label={lang === 'id' ? 'Tutup galeri' : 'Close gallery'}><XMarkIcon style={{ width: 22, height: 22 }} /></button>
          {lightbox! > 0 && (
            <button className="lightbox__nav lightbox__nav--prev" onClick={e => { e.stopPropagation(); movePrev() }} aria-label={lang === 'id' ? 'Foto sebelumnya' : 'Previous photo'}><ChevronLeftIcon style={{ width: 28, height: 28 }} /></button>
          )}
          {lightbox! < items.length - 1 && (
            <button className="lightbox__nav lightbox__nav--next" onClick={e => { e.stopPropagation(); moveNext() }} aria-label={lang === 'id' ? 'Foto berikutnya' : 'Next photo'}><ChevronRightIcon style={{ width: 28, height: 28 }} /></button>
          )}
        </div>
      )}
    </>
  )
}
