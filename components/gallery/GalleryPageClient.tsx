'use client'

import { useEffect, useMemo, useState } from 'react'

type GalleryItem = {
  id: number
  src: string
  alt_id: string
  alt_en: string
  section: string
}

const SIZES = ['tall', '', 'wide', '', '', 'tall', '', 'wide']

const FILTERS = [
  { key: 'all', labelEn: 'All', labelId: 'Semua' },
  { key: 'indoor', labelEn: 'Indoor', labelId: 'Indoor' },
  { key: 'outdoor', labelEn: 'Semi-Outdoor', labelId: 'Semi-Outdoor' },
]

export default function GalleryPageClient({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState('all')
  const [lang, setLang] = useState<'en' | 'id'>('en')

  useEffect(() => {
    const applyLang = (value?: string) => {
      setLang(value === 'id' ? 'id' : 'en')
    }

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

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter(item => item.section === filter)),
    [filter, items]
  )

  useEffect(() => {
    const detail = { lang }
    window.dispatchEvent(new CustomEvent('cotch:gallery-refresh', { detail }))
  }, [filter, lang])

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)', fontSize: '.95rem' }} data-copy-en="No published photos yet. Add some from the admin Gallery page." data-copy-id="Belum ada foto yang dipublikasikan. Tambahkan di halaman admin Gallery.">
        Belum ada foto yang dipublikasikan. Tambahkan di halaman admin Gallery.
      </div>
    )
  }

  return (
    <>
      <div className="menu-tabs" style={{ marginBottom: 36 }}>
        {FILTERS.map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`tab-btn${filter === tab.key ? ' active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {lang === 'id' ? tab.labelId : tab.labelEn}
          </button>
        ))}
      </div>

      <div className="gallery-grid" id="galleryGrid">
        {filtered.map((item, index) => {
          const cls = SIZES[index % SIZES.length]
          return (
            <div
              key={item.id}
              className={`gallery-item${cls ? ` ${cls}` : ''}`}
              data-section={item.section}
              data-aos="fade-up"
              data-aos-delay={(index % 4) * 80}
            >
              <a
                href={item.src}
                className="glightbox"
                data-type="image"
                data-gallery={`gallery-${filter}`}
                data-title={lang === 'id' ? item.alt_id : item.alt_en}
                data-description={lang === 'id' ? item.alt_id : item.alt_en}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={lang === 'id' ? item.alt_id : item.alt_en}
                  data-alt-en={item.alt_en}
                  data-alt-id={item.alt_id}
                  loading="lazy"
                />
                <div className="gallery-item__overlay">
                  <span className="gallery-item__label">{lang === 'id' ? item.alt_id : item.alt_en}</span>
                </div>
              </a>
            </div>
          )
        })}
      </div>
    </>
  )
}
