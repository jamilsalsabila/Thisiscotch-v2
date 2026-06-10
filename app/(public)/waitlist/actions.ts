'use server'

import { createClient } from '@/lib/supabase/server'
import { generateCode } from '@/utils/format'
import type { Database } from '@/types/database'

export async function joinWaitlist(data: {
  guestName: string
  guestPhone: string
  guestEmail: string
  partySize: number
  preferredDate: string
  preferredTime: string
  specialRequest: string
}): Promise<{ success: boolean; waitlistCode?: string; position?: number; error?: string }> {
  const supabase = await createClient()
  if (data.preferredDate < new Date().toISOString().split('T')[0]) {
    return { success: false, error: 'Cannot join waitlist for a past date.' }
  }
  const waitlistCode = generateCode('WL')
  const payload: Database['public']['Tables']['waitlist']['Insert'] = {
    waitlist_code: waitlistCode,
    guest_name: data.guestName,
    guest_phone: data.guestPhone,
    guest_email: data.guestEmail || null,
    party_size: data.partySize,
    preferred_date: data.preferredDate,
    preferred_time: data.preferredTime,
    special_request: data.specialRequest || null,
    status: 'waiting',
  }

  const { error } = await (supabase.from('waitlist') as any).insert([payload])

  if (error) return { success: false, error: error.message }

  const { count } = await (supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .eq('preferred_date', data.preferredDate)
    .eq('status', 'waiting') as any)

  return { success: true, waitlistCode, position: count ?? 1 }
}

export async function cancelWaitlist(
  code: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await ((supabase.from('waitlist') as any)
    .update({ status: 'cancelled' })
    .eq('waitlist_code', code.trim().toUpperCase())
    .eq('status', 'waiting')
    .select('id')
    .single() as any)

  if (error || !data) return { success: false, error: 'Waitlist entry not found or already cancelled.' }
  return { success: true }
}
