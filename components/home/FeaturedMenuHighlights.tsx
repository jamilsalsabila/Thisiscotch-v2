'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { formatRupiah } from '@/utils/format'
import type { Database } from '@/types/database'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

function getVisibleSlides(width: number) {
  if (width >= 900) return 3
  if (width >= 580) return 2
  return 1
}

export default function FeaturedMenuHighlights({ items }: { items: MenuItem[] }) {
  const [visibleSlides, setVisibleSlides] = useState(3)
  const [page, setPage] = useState(0)
  const [paused, setPaused] = useState(false)
  const [lang, setLang] = useState<'en' | 'id'>('en')
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const sync = () => setVisibleSlides(getVisibleSlides(window.innerWidth))
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

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

  const maxPage = useMemo(
    () => Math.max(0, Math.ceil(items.length / visibleSlides) - 1),
    [items.length, visibleSlides]
  )

  useEffect(() => {
    setPage(current => Math.min(current, maxPage))
  }, [maxPage])

  useEffect(() => {
    if (maxPage <= 0 || paused) return

    timerRef.current = window.setInterval(() => {
      setPage(current => (current >= maxPage ? 0 : current + 1))
    }, 4500)

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current)
      }
    }
  }, [maxPage, paused])

  const currentIndex = page * visibleSlides
  const slideWidth = 100 / items.length
  const translate = currentIndex * slideWidth

  return (
    <div
      className="featured-menu"
      data-aos="fade-up"
      data-aos-delay="100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="featured-menu__viewport">
        <div
          className="featured-menu__track"
          style={{
            width: `${(items.length * 100) / visibleSlides}%`,
            transform: `translate3d(-${translate}%, 0, 0)`,
          }}
        >
          {items.map(item => (
            <div
              key={item.id}
              className="featured-menu__slide"
              style={{ width: `${100 / items.length}%` }}
            >
              <div className="menu-card featured-menu__card" style={{ position: 'relative' }}>
                <div className="menu-card__img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image || '/assets/images/menu-placeholder.svg'} alt={item.name_en} loading="lazy" />
                  {item.is_featured ? <span className="menu-card__badge-featured" data-copy-en="Featured" data-copy-id="Unggulan">Featured</span> : null}
                </div>
                <div className="menu-card__body">
                  <div className="menu-card__sub">{item.subcategory ? item.subcategory.charAt(0).toUpperCase() + item.subcategory.slice(1) : ''}</div>
                  <div className="menu-card__name">{lang === 'id' ? (item.name_id || item.name_en) : item.name_en}</div>
                  <div className="menu-card__desc">{lang === 'id' ? (item.description_id || item.description_en || '') : (item.description_en || item.description_id || '')}</div>
                  <div className="menu-card__footer">
                    <span className="menu-card__price">{formatRupiah(item.price)}</span>
                    <Link href="/order" className="menu-card__add" aria-label={lang === 'id' ? 'Pesan ini' : 'Order this'} title={lang === 'id' ? 'Pesan ini' : 'Order this'}>+</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {maxPage > 0 ? (
        <div className="featured-menu__controls">
          <button
            type="button"
            className="featured-menu__nav featured-menu__nav--prev"
            onClick={() => {
              setPaused(true)
              setPage(current => Math.max(0, current - 1))
            }}
            disabled={page === 0}
            aria-label="Previous menu highlight"
          >
            ‹
          </button>
          <div className="featured-menu__dots">
            {Array.from({ length: maxPage + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                className={`featured-menu__dot${page === index ? ' active' : ''}`}
                onClick={() => {
                  setPaused(true)
                  setPage(index)
                }}
                aria-label={`Go to menu highlight page ${index + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            className="featured-menu__nav featured-menu__nav--next"
            onClick={() => {
              setPaused(true)
              setPage(current => Math.min(maxPage, current + 1))
            }}
            disabled={page === maxPage}
            aria-label="Next menu highlight"
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  )
}
