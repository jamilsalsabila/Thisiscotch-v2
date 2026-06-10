import Link from 'next/link'
import { requireAdminAccess } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { deleteReview, publishReview, saveReviewReply, toggleReviewFeatured } from '@/app/admin/actions'
import LegacyIcon from '@/components/ui/LegacyIcon'

type SearchParams = Promise<{ tab?: string }>

function asArray(value: unknown) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function asRecord(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, number>
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, number> : {}
    } catch {
      return {}
    }
  }
  return {}
}

export default async function AdminReviews({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminAccess()
  const { tab = 'pending' } = await searchParams
  const supabase = createAdminClient()
  const { data: reviews } = await (supabase.from('reviews').select('*').order('created_at', { ascending: false }) as any)

  const allReviews = (reviews as any[]) ?? []
  const counts = {
    pending: allReviews.filter(review => !review.is_published).length,
    published: allReviews.filter(review => review.is_published).length,
    featured: allReviews.filter(review => review.is_published && review.is_featured).length,
  }

  const filtered = allReviews.filter(review => {
    if (tab === 'pending') return !review.is_published
    if (tab === 'published') return review.is_published
    if (tab === 'featured') return review.is_published && review.is_featured
    return true
  })

  return (
    <>
      <div
        className="tabs"
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 20,
          background: 'var(--a-bg)',
          borderRadius: 8,
          padding: 4,
          width: 'fit-content',
        }}
      >
        {[
          { key: 'pending', label: 'Pending', count: counts.pending },
          { key: 'published', label: 'Published', count: counts.published },
          { key: 'featured', label: 'Featured', count: counts.featured },
          { key: 'all', label: 'All', count: null },
        ].map(item => (
          <Link
            key={item.key}
            href={`/admin/reviews?tab=${item.key}`}
            className={`tab-link${tab === item.key ? ' active' : ''}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 6 }}
          >
            {item.label}
            {item.count !== null ? (
              <span
                style={{
                  background: tab === item.key ? 'var(--a-red)' : 'var(--a-bg)',
                  color: tab === item.key ? '#fff' : 'inherit',
                  borderRadius: 99,
                  padding: '1px 8px',
                  fontSize: '.7rem',
                }}
              >
                {item.count}
              </span>
            ) : null}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--a-muted)', background: '#fff', borderRadius: 8, border: '1px dashed var(--a-border)' }}>
          Tidak ada review di tab ini.
        </div>
      ) : (
        <div>
          {filtered.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </>
  )
}

function ReviewCard({ review }: { review: any }) {
  const ratings = asRecord(review.ratings_json ?? review.ratings)
  const photos = asArray(review.photos_json ?? review.photos)
  const avg = review.overall_rating ? Number(review.overall_rating).toFixed(1) : '—'
  const sourceCode = review.source_code ?? review.booking_code ?? review.order_code ?? null
  const sourceType = review.source_type ?? (review.booking_code ? 'booking' : review.order_code ? 'order' : null)
  const email = review.reviewer_email ?? null
  const adminReply = review.admin_reply ?? ''

  return (
    <div className="a-card admin-review-card" style={{ padding: 18, marginBottom: 14, borderRadius: 8, border: '1px solid var(--a-border)' }}>
      <div className="admin-review-head" style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '1rem' }}>
            {review.reviewer_name}
            <span style={{ display: 'inline-flex', gap: 6, marginLeft: 8, flexWrap: 'wrap' }}>
              {review.is_verified && <span className="a-badge a-badge--green" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><LegacyIcon name="check-badge" size={13} /> Verified</span>}
              {review.is_featured && <span className="a-badge a-badge--gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><LegacyIcon name="star" size={13} /> Featured</span>}
              {!review.is_published && <span className="a-badge a-badge--gray">Pending</span>}
            </span>
          </div>
          <div className="admin-review-meta" style={{ fontSize: '.78rem', color: 'var(--a-muted)' }}>
            {new Date(review.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            {sourceCode ? <> · <code>{sourceCode}</code>{sourceType ? ` (${sourceType})` : ''}</> : null}
            {email ? <> · {email}</> : null}
          </div>
        </div>
        <div className="admin-review-score" style={{ textAlign: 'right' }}>
          <div style={{ color: '#fbbf24', letterSpacing: 1, fontSize: '1.1rem' }}>{'★'.repeat(Math.round(Number(review.overall_rating ?? 0))).padEnd(5, '☆')}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--a-muted)' }}>{avg} overall</div>
        </div>
      </div>

      {Object.keys(ratings).length > 0 && (
        <div className="admin-review-rating-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0' }}>
          {Object.entries(ratings).map(([category, value]) => (
            <span key={category} style={{ fontSize: '.72rem', padding: '3px 8px', background: 'var(--a-bg)', borderRadius: 99 }}>
              {category}: <strong>{value}★</strong>
            </span>
          ))}
        </div>
      )}

      <div style={{ fontSize: '.92rem', lineHeight: 1.5, color: 'var(--a-text)', padding: '10px 0' }}>
        {review.comment || '—'}
      </div>

      {photos.length > 0 ? (
        <div className="admin-review-photos" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
          {photos.map((photo: string) => (
            <a key={photo} href={photo} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--a-border)' }} />
            </a>
          ))}
        </div>
      ) : null}

      {adminReply ? (
        <div style={{ marginTop: 10, padding: 10, background: '#fffbeb', borderLeft: '3px solid #d4941a', borderRadius: '0 6px 6px 0', fontSize: '.85rem' }}>
          <strong>Your reply:</strong> {adminReply}
          {review.admin_reply_at ? <div style={{ fontSize: '.7rem', color: 'var(--a-muted)', marginTop: 4 }}>{new Date(review.admin_reply_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div> : null}
        </div>
      ) : null}

      <div className="admin-review-actions" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--a-border)' }}>
        {!review.is_published ? (
          <form action={async () => { 'use server'; await publishReview(review.id, true) }}>
            <button className="a-btn a-btn--success a-btn--xs" type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <LegacyIcon name="check-badge" size={14} /> Publish
            </button>
          </form>
        ) : (
          <>
            <form action={async () => { 'use server'; await publishReview(review.id, false) }}>
              <button className="a-btn a-btn--outline a-btn--xs" type="submit">Unpublish</button>
            </form>
            <form action={async () => { 'use server'; await toggleReviewFeatured(review.id, !review.is_featured) }}>
              <button className={`a-btn a-btn--xs ${review.is_featured ? 'a-btn--outline' : 'a-btn--primary'}`} type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <LegacyIcon name="star" size={14} /> {review.is_featured ? 'Unfeature' : 'Feature'}
              </button>
            </form>
          </>
        )}

        <details className="admin-review-reply-details">
          <summary className="a-btn a-btn--outline a-btn--xs" style={{ listStyle: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <LegacyIcon name="chat-bubble" size={14} /> {adminReply ? 'Edit Reply' : 'Reply'}
          </summary>
          <form action={async (formData: FormData) => {
            'use server'
            await saveReviewReply(review.id, String(formData.get('reply') ?? ''))
          }} style={{ marginTop: 10 }} className="admin-review-reply-form">
            <textarea
              name="reply"
              maxLength={1000}
              defaultValue={adminReply}
              placeholder="Tulis balasan (atau kosongkan untuk hapus reply)…"
              className="a-textarea"
              style={{ minHeight: 60 }}
            />
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <button className="a-btn a-btn--primary a-btn--sm" type="submit">Save Reply</button>
            </div>
          </form>
        </details>

        <form action={async () => { 'use server'; await deleteReview(review.id) }}>
          <button className="a-btn a-btn--danger a-btn--xs" type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <LegacyIcon name="x-mark" size={14} /> Delete
          </button>
        </form>
      </div>
    </div>
  )
}
