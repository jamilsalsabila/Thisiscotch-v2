'use client'

import { useEffect, useMemo, useState } from 'react'
import { submitReview } from '@/app/(public)/reviews/actions'
import type { Database } from '@/types/database'
import LegacyIcon from '@/components/ui/LegacyIcon'

type Review = Database['public']['Tables']['reviews']['Row']

const RATING_ASPECTS = [
  { key: 'taste', labelEn: 'Taste', labelId: 'Rasa' },
  { key: 'ambience', labelEn: 'Ambience', labelId: 'Ambience' },
  { key: 'service', labelEn: 'Service', labelId: 'Service' },
  { key: 'value', labelEn: 'Value', labelId: 'Value' },
]

const RATING_LABEL_ALIASES: Record<string, { en: string; id: string }> = {
  taste: { en: 'Taste', id: 'Rasa' },
  rasa: { en: 'Taste', id: 'Rasa' },
  ambience: { en: 'Ambience', id: 'Ambience' },
  ambiance: { en: 'Ambience', id: 'Ambience' },
  place: { en: 'Place', id: 'Tempat' },
  service: { en: 'Service', id: 'Service' },
  value: { en: 'Value', id: 'Value' },
  coffee: { en: 'Coffee', id: 'Kopi' },
  food: { en: 'Food', id: 'Makanan' },
  drinks: { en: 'Drinks', id: 'Minuman' },
  drink: { en: 'Drink', id: 'Minuman' },
  cleanliness: { en: 'Cleanliness', id: 'Kebersihan' },
}

function titleCaseLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase())
}

function getRatingLabel(key: string, lang: 'en' | 'id') {
  const normalized = key.trim().toLowerCase()
  const alias = RATING_LABEL_ALIASES[normalized]
  if (alias) return lang === 'id' ? alias.id : alias.en
  return titleCaseLabel(key)
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
            fontSize: '1.5rem', lineHeight: 1,
            color: star <= (hover || value) ? 'var(--gold)' : 'var(--border)',
            transition: 'color .15s',
          }}
          aria-label={`${star} bintang`}
          data-aria-label-en={`${star} stars`}
          data-aria-label-id={`${star} bintang`}
        >★</button>
      ))}
    </div>
  )
}

interface Props {
  published: Review[]
  prefillCode?: string
}

export default function ReviewsClient({ published, prefillCode = '' }: Props) {
  const [lang, setLang] = useState<'en' | 'id'>('en')
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'verified' | 5 | 4>('all')
  const [visibleCount, setVisibleCount] = useState(12)
  const [customCategory, setCustomCategory] = useState('')
  const [form, setForm] = useState({
    reviewerName: '', bookingCode: '', orderCode: '', comment: '',
    ratings: {} as Record<string, number>,
  })

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

  useEffect(() => {
    if (!prefillCode) return
    const code = prefillCode.toUpperCase()
    setForm(f => ({
      ...f,
      bookingCode: code.startsWith('COTCH-') || code.startsWith('BKG-') ? code : f.bookingCode,
      orderCode: code.startsWith('ORD-') ? code : f.orderCode,
    }))
    setShowForm(true)
  }, [prefillCode])

  function setRating(key: string, val: number) {
    setForm(f => ({ ...f, ratings: { ...f.ratings, [key]: val } }))
  }

  function addCustomCategory() {
    const normalized = customCategory.trim()
    if (!normalized) return
    setForm(current => {
      if (Object.keys(current.ratings).some(key => key.toLowerCase() === normalized.toLowerCase())) {
        return current
      }
      return { ...current, ratings: { ...current.ratings, [normalized]: current.ratings[normalized] ?? 0 } }
    })
    setCustomCategory('')
  }

  function removeCustomCategory(key: string) {
    setForm(current => {
      const next = { ...current.ratings }
      delete next[key]
      return { ...current, ratings: next }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (Object.keys(form.ratings).length === 0) {
      setError(lang === 'id' ? 'Beri setidaknya satu rating bintang.' : 'Please give at least one star rating.')
      return
    }
    setSubmitting(true); setError('')
    const res = await submitReview(form)
    setSubmitting(false)
    if (!res.success) { setError(res.error ?? (lang === 'id' ? 'Terjadi kesalahan.' : 'Something went wrong.')); return }
    setSubmitted(true)
    setShowForm(false)
  }

  const avgRating = (review: Review) => {
    const vals = Object.values(review.ratings as Record<string, number>)
    if (!vals.length) return review.overall_rating ?? 0
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }

  const overallAverage = published.length
    ? published.reduce((sum, review) => sum + avgRating(review), 0) / published.length
    : 0

  const filtered = useMemo(() => {
    if (filter === 'verified') return published.filter(review => review.is_verified)
    if (filter === 5) return published.filter(review => Math.round(avgRating(review)) >= 5)
    if (filter === 4) return published.filter(review => avgRating(review) >= 4)
    return published
  }, [filter, published])

  const visibleReviews = filtered.slice(0, visibleCount)
  const formRatingKeys = useMemo(() => {
    const defaults = RATING_ASPECTS.map(item => item.key)
    const extras = Object.keys(form.ratings).filter(key => !defaults.includes(key))
    return [...defaults, ...extras]
  }, [form.ratings])

  function humanDate(date: string) {
    return new Date(date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <>
      <div className="rev-summary" style={{ marginBottom: 32 }}>
        <div className="rev-summary__big">
          <div className="rev-summary__num">{published.length ? overallAverage.toFixed(1) : '—'}</div>
          <div style={{ display: 'inline-flex', gap: 2, color: '#fbbf24', fontSize: '1.5rem' }}>
            {[1, 2, 3, 4, 5].map(s => <span key={s}>{s <= Math.round(overallAverage) ? '★' : '☆'}</span>)}
          </div>
          <div className="rev-summary__count">
            <strong>{published.length}</strong> <span data-copy-en="total reviews" data-copy-id="total ulasan">total reviews</span>
          </div>
        </div>
        <div className="rev-summary__cta">
          <button className="btn btn--primary" onClick={() => setShowForm(true)}>
            <span data-copy-en="Write a Review" data-copy-id="Tulis Ulasan">Write a Review</span>
          </button>
          <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 8, textAlign: 'center' }}>
            <span data-copy-en="Have a booking/order code? Your review can be published automatically with a Verified badge." data-copy-id="Punya kode booking/order? Review Anda otomatis tayang & ber-badge Verified.">Have a booking/order code? Your review can be published automatically with a Verified badge.</span>
          </p>
        </div>
      </div>

      <div className="rev-filters" style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'all' as const, labelEn: 'All', labelId: 'Semua' },
          { key: 5 as const, labelEn: '5★ Only', labelId: '5★ Saja' },
          { key: 4 as const, labelEn: '4★ & up', labelId: '4★ ke atas' },
          { key: 'verified' as const, labelEn: 'Verified Only', labelId: 'Verified Saja', icon: 'check-badge' as const },
        ].map(item => (
          <button
            key={String(item.key)}
            type="button"
            className={`tab-btn${filter === item.key ? ' active' : ''}`}
            onClick={() => {
              setFilter(item.key)
              setVisibleCount(12)
            }}
            style={item.icon ? { display: 'inline-flex', alignItems: 'center', gap: 5 } : undefined}
          >
            {item.icon ? <LegacyIcon name={item.icon} size={15} /> : null}
            {lang === 'id' ? item.labelId : item.labelEn}
          </button>
        ))}
      </div>

      {/* Published reviews grid */}
      {filtered.length > 0 ? (
        <>
        <div className="rev-list" style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', marginBottom: 24 }}>
          {visibleReviews.map(review => {
            const avg = avgRating(review)
            const ratingEntries = Object.entries((review.ratings ?? {}) as Record<string, number>).filter(([, value]) => Number(value) > 0)
            return (
              <div key={review.id} className="rev-card" style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="rev-card__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div>
                    <div className="rev-card__name" style={{ fontWeight: 600 }}>
                      {review.reviewer_name}
                      {review.is_verified ? (
                        <span className="rev-card__verified" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.7rem', fontWeight: 600, color: '#16a34a', background: '#dcfce7', padding: '2px 7px', borderRadius: 99, marginLeft: 6 }}>
                          <LegacyIcon name="check-badge" size={13} />
                          <span data-copy-en="Verified" data-copy-id="Terverifikasi">Verified</span>
                        </span>
                      ) : null}
                    </div>
                    <div className="rev-card__date" style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 4 }}>{humanDate(review.created_at)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 4, justifyContent: 'flex-end' }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ color: s <= Math.round(avg) ? 'var(--gold)' : 'var(--border)', fontSize: '1rem' }}>★</span>
                    ))}
                      <span style={{ fontSize: '.78rem', color: 'var(--muted)', marginLeft: 6, alignSelf: 'center' }}>
                      {avg.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {ratingEntries.length > 0 && (
                  <div className="rev-card__tags" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {ratingEntries.map(([key, value]) => (
                      <span key={key} className="rev-card__tag" style={{ fontSize: '.7rem', padding: '3px 8px', background: 'var(--cream-dark)', borderRadius: 99, color: 'var(--text-dark)' }}>
                        {getRatingLabel(key, lang)} <strong style={{ color: 'var(--red)' }}>{value}★</strong>
                      </span>
                    ))}
                  </div>
                )}

                <p style={{ fontSize: '.92rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: 0, flex: 1 }}>
                  {review.comment}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--red)', flexShrink: 0 }}>
                    {review.reviewer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{review.reviewer_name}</div>
                    <div style={{ fontSize: '.72rem', color: review.is_verified ? '#16a34a' : 'var(--muted)' }}>
                      {review.is_verified ? (
                        <><LegacyIcon name="check-badge" size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> <span data-copy-en="Verified Guest" data-copy-id="Tamu Terverifikasi">Verified Guest</span></>
                      ) : (
                        <span data-copy-en="Public Guest" data-copy-id="Tamu Umum">Public Guest</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {filtered.length > visibleCount ? (
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <button type="button" className="btn btn--outline" onClick={() => setVisibleCount(v => v + 12)}>
              <span data-copy-en="Load More" data-copy-id="Muat Lebih Banyak">Load More</span>
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: 56 }} />
        )}
        </>
      ) : (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)', marginBottom: 40 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>💬</div>
            <p style={{ fontWeight: 600, marginBottom: 8 }} data-copy-en="No reviews match this filter" data-copy-id="Tidak ada ulasan yang cocok dengan filter ini">No reviews match this filter</p>
            <p style={{ fontSize: '.875rem' }} data-copy-en="Try another filter or be the first to share your experience." data-copy-id="Coba filter lain atau jadilah yang pertama membagikan pengalaman Anda.">Try another filter or be the first to share your experience.</p>
          </div>
      )}

      {/* Submit section */}
      {submitted ? (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', background: 'rgba(22,163,74,.08)', border: '1.5px solid #16a34a', borderRadius: 'var(--radius)', padding: 32 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎉</div>
            <h3 style={{ marginBottom: 8, color: '#15803d' }} data-copy-en="Thank you!" data-copy-id="Terima kasih!">Thank you!</h3>
            <p style={{ color: 'var(--muted)', fontSize: '.9rem' }} data-copy-en="Your review has been received and will appear after admin verification." data-copy-id="Ulasan Anda sudah kami terima dan akan tampil setelah diverifikasi admin.">
              Your review has been received and will appear after admin verification.
            </p>
            <button className="btn btn--outline btn--sm" style={{ marginTop: 20 }} onClick={() => { setSubmitted(false); setShowForm(false) }}>
              <span data-copy-en="Write Another Review" data-copy-id="Tulis Ulasan Lain">Write Another Review</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {!showForm ? (
            <div style={{ textAlign: 'center' }}>
              <button className="btn btn--primary" onClick={() => setShowForm(true)}>
                <LegacyIcon name="pencil" size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> <span data-copy-en="Write a Review" data-copy-id="Tulis Ulasan">Write a Review</span>
              </button>
            </div>
          ) : null}

          {showForm ? (
            <div className="modal-backdrop active" style={{ display: 'flex' }} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
              <div className="modal" style={{ maxWidth: 560 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ margin: 0 }} data-copy-en="Write a Review" data-copy-id="Tulis Ulasan">Write a Review</h3>
                  <button type="button" className="modal-close" onClick={() => setShowForm(false)} aria-label="Close">
                    <LegacyIcon name="x-mark" size={18} />
                  </button>
                </div>
                <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: 18 }}>
                  <span data-copy-en="Share your experience at Cotch. Reviews with a booking/order code can be published automatically." data-copy-id="Bagikan pengalamanmu di Cotch. Review dengan kode booking/order otomatis tayang.">Share your experience at Cotch. Reviews with a booking/order code can be published automatically.</span>
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label" data-copy-en="Name *" data-copy-id="Nama *">Name *</label>
                    <input className="form-input" required value={form.reviewerName}
                      onChange={e => setForm(f => ({ ...f, reviewerName: e.target.value }))}
                      placeholder="Nama Anda" data-placeholder-en="Your name" data-placeholder-id="Nama Anda" />
                  </div>

                  <div className="date-row">
                    <div className="form-group">
                      <label className="form-label" data-copy-en="Booking Code" data-copy-id="Kode Booking">Kode Booking</label>
                      <input className="form-input" value={form.bookingCode}
                        onChange={e => setForm(f => ({ ...f, bookingCode: e.target.value.toUpperCase() }))}
                        placeholder="COTCH-..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label" data-copy-en="Order Code" data-copy-id="Kode Order">Kode Order</label>
                      <input className="form-input" value={form.orderCode}
                        onChange={e => setForm(f => ({ ...f, orderCode: e.target.value.toUpperCase() }))}
                        placeholder="ORD-XXXXXX" />
                    </div>
                  </div>
                  <p className="form-hint" style={{ marginTop: -12, marginBottom: 20 }} data-copy-en="Have a code? Your review can be published automatically with a &quot;Verified&quot; badge." data-copy-id="Punya kode? Review otomatis tayang dengan badge &quot;Verified&quot;." data-copy-mode="html">
                    Have a code? Your review can be published automatically with a &quot;Verified&quot; badge.
                  </p>

                  <div className="form-group">
                    <label className="form-label" data-copy-en="Category Ratings *" data-copy-id="Rating Kategori *">Category Ratings *</label>
                    <p className="form-hint" style={{ marginTop: 0, marginBottom: 10 }} data-copy-en="Choose the categories you want to rate (you can choose more than one):" data-copy-id="Pilih kategori yang ingin Anda rating (boleh lebih dari satu):">
                      Choose the categories you want to rate (you can choose more than one):
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {formRatingKeys.map(key => {
                        const isDefault = RATING_ASPECTS.some(item => item.key === key)
                        return (
                        <div key={key} className="review-rating-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--cream-dark)', borderRadius: 6, justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '.88rem', fontWeight: 500 }}>{getRatingLabel(key, lang)}</span>
                          <div className="review-rating-row__controls" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <StarRating value={form.ratings[key] ?? 0} onChange={v => setRating(key, v)} />
                            {!isDefault ? (
                              <button type="button" className="modal-close" onClick={() => removeCustomCategory(key)} aria-label={lang === 'id' ? 'Hapus kategori' : 'Remove category'}>
                                <LegacyIcon name="x-mark" size={14} />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      )})}
                    </div>
                    <div className="lookup-actions-row" style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        className="form-input"
                        maxLength={40}
                        value={customCategory}
                        onChange={e => setCustomCategory(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addCustomCategory()
                          }
                        }}
                        placeholder={lang === 'id' ? 'Kategori lain (mis. Kebersihan)' : 'Other category (e.g. Cleanliness)'}
                        data-placeholder-en="Other category (e.g. Cleanliness)"
                        data-placeholder-id="Kategori lain (mis. Kebersihan)"
                        style={{ flex: 1, minWidth: 180 }}
                      />
                      <button type="button" className="btn btn--outline btn--sm" onClick={addCustomCategory}>
                        <span data-copy-en="+ Add" data-copy-id="+ Tambah">+ Add</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" data-copy-en="Comment" data-copy-id="Komentar">Komentar</label>
                    <textarea className="form-textarea" rows={4} value={form.comment}
                      onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                      placeholder="Bagikan pengalaman Anda… (10–1000 karakter)" data-placeholder-en="Share your experience… (10–1000 characters)" data-placeholder-id="Bagikan pengalaman Anda… (10–1000 karakter)" />
                  </div>

                  {error && (
                    <div style={{ background: 'rgba(220,38,38,.08)', border: '1.5px solid #dc2626', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 20, color: '#dc2626', fontSize: '.875rem' }}>
                      {error}
                    </div>
                  )}

                  <div className="ticket-actions-row" style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button type="submit" className={`btn btn--primary${submitting ? ' btn--loading' : ''}`} style={{ flex: 1, justifyContent: 'center' }} disabled={submitting}>
                      {submitting ? '' : <span data-copy-en="Submit Review" data-copy-id="Kirim Ulasan">Submit Review</span>}
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>
                      <span data-copy-en="Cancel" data-copy-id="Batal">Cancel</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </>
      )}
    </>
  )
}
