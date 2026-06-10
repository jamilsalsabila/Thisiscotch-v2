import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { createAdminClient, hasAdminSupabaseEnv } from '@/lib/supabase/server'
import ReviewsClient from '@/components/reviews/ReviewsClient'

export const metadata: Metadata = { title: 'Customer Reviews' }

const getPublishedReviews = unstable_cache(
  async () => {
    if (!hasAdminSupabaseEnv()) return []
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    return data ?? []
  },
  ['reviews_published'],
  { revalidate: 60 }
)

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const published = await getPublishedReviews()
  const params = await searchParams
  const codeValue = params?.code
  const prefillCode = Array.isArray(codeValue) ? codeValue[0] : codeValue
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="section-label" data-copy-en="Reviews" data-copy-id="Ulasan">Reviews</div>
          <h1 data-copy-en="What Our Guests Say" data-copy-id="Apa Kata Tamu Kami">What Our Guests Say</h1>
          <p data-copy-en="Real stories from real visitors. Tell us yours." data-copy-id="Cerita nyata dari pengunjung nyata. Ceritakan pengalamanmu juga.">Real stories from real visitors. Tell us yours.</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <ReviewsClient published={published} prefillCode={prefillCode || ''} />
        </div>
      </section>
    </>
  )
}
