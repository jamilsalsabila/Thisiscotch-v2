'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { formatRupiah } from '@/utils/format'

type MenuItem = {
  id: number
  name_en: string
  name_id: string
  description_en: string
  description_id: string
  image: string
  category: string
  subcategory: string
  is_featured: boolean
  price: number
}

type CategoryLabels = Record<string, { en: string; id: string }>

export default function MenuPageClient({
  categories,
  grouped,
  labels,
}: {
  categories: string[]
  grouped: Record<string, Record<string, MenuItem[]>>
  labels: CategoryLabels
}) {
  const [activeTab, setActiveTab] = useState('all')
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

  const allTabs = useMemo(() => ['all', ...categories], [categories])

  return (
    <>
      <div className="menu-tabs">
        {allTabs.map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'all' ? (lang === 'id' ? 'Semua' : 'All') : (lang === 'id' ? labels[tab]?.id : labels[tab]?.en) ?? tab}
          </button>
        ))}
      </div>

      {activeTab === 'all' ? (
        <div id="tab-all">
          {categories.map(category => {
            const subgroups = grouped[category]
            if (!subgroups) return null

            return (
              <div key={category} style={{ marginBottom: 56 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                  <h2 className="menu-cat-heading">
                    {(lang === 'id' ? labels[category]?.id : labels[category]?.en) ?? category}
                  </h2>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>

                {Object.entries(subgroups).map(([subcategory, items]) => (
                  <div key={subcategory || 'general'} style={{ marginBottom: 32 }}>
                    {subcategory && subcategory !== 'general' ? (
                      <h4
                        style={{
                          fontSize: '.85rem',
                          fontWeight: 600,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          color: 'var(--muted)',
                          marginBottom: 16,
                          paddingBottom: 6,
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        {subcategory}
                      </h4>
                    ) : null}

                    <div className="menu-grid">
                      {items.map(item => (
                        <div key={item.id} className="menu-card" data-aos="fade-up">
                          <div className="menu-card__img">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image || '/assets/images/menu-placeholder.svg'} alt={lang === 'id' ? (item.name_id || item.name_en) : item.name_en} loading="lazy" />
                            {item.is_featured ? <span className="menu-card__badge-featured" data-copy-en="Featured" data-copy-id="Unggulan">Featured</span> : null}
                          </div>
                          <div className="menu-card__body">
                            <div className="menu-card__sub">
                              {subcategory && subcategory !== 'general' ? subcategory : (lang === 'id' ? labels[category]?.id : labels[category]?.en) ?? category}
                            </div>
                            <div className="menu-card__name">{lang === 'id' ? item.name_id : item.name_en}</div>
                            <div className="menu-card__desc">{lang === 'id' ? (item.description_id || item.description_en) : (item.description_en || item.description_id)}</div>
                            <div className="menu-card__footer">
                              <span className="menu-card__price">{formatRupiah(item.price)}</span>
                              <Link href="/order" className="menu-card__add" title="Order this" data-title-en="Order this" data-title-id="Pesan ini" aria-label={lang === 'id' ? 'Pesan ini' : 'Order this'}>+</Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      ) : (
        <div id={`tab-${activeTab}`}>
          {Object.entries(grouped[activeTab] || {}).map(([subcategory, items]) => (
            <div key={subcategory || 'general'} style={{ marginBottom: 40 }}>
              {subcategory && subcategory !== 'general' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{subcategory}</h3>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>
              ) : null}

              <div className="menu-grid">
                {items.map(item => (
                  <div key={item.id} className="menu-card" data-aos="fade-up">
                    <div className="menu-card__img">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image || '/assets/images/menu-placeholder.svg'} alt={lang === 'id' ? (item.name_id || item.name_en) : item.name_en} loading="lazy" />
                      {item.is_featured ? <span className="menu-card__badge-featured" data-copy-en="Featured" data-copy-id="Unggulan">Featured</span> : null}
                    </div>
                    <div className="menu-card__body">
                      {subcategory && subcategory !== 'general' ? <div className="menu-card__sub">{subcategory}</div> : null}
                      <div className="menu-card__name">{lang === 'id' ? item.name_id : item.name_en}</div>
                      <div className="menu-card__desc">{lang === 'id' ? (item.description_id || item.description_en) : (item.description_en || item.description_id)}</div>
                      <div className="menu-card__footer">
                        <span className="menu-card__price">{formatRupiah(item.price)}</span>
                        <Link href="/order" className="menu-card__add" title="Order this" data-title-en="Order this" data-title-id="Pesan ini" aria-label={lang === 'id' ? 'Pesan ini' : 'Order this'}>+</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
