'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

export async function submitReview(data: {
  reviewerName: string
  bookingCode: string
  orderCode: string
  comment: string
  ratings: Record<string, number>
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const overallRating = Object.values(data.ratings).length > 0
    ? Object.values(data.ratings).reduce((a, b) => a + b, 0) / Object.values(data.ratings).length
    : null
  const payload: Database['public']['Tables']['reviews']['Insert'] = {
    reviewer_name: data.reviewerName,
    booking_code: data.bookingCode || null,
    order_code: data.orderCode || null,
    comment: data.comment || null,
    ratings: data.ratings,
    overall_rating: overallRating,
    is_verified: !!(data.bookingCode || data.orderCode),
    is_published: false,
  }

  const { error } = await (supabase.from('reviews') as any).insert([payload])

  if (error) return { success: false, error: error.message }
  return { success: true }
}
