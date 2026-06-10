'use server'

import { createClient } from '@/lib/supabase/server'

export async function lookupRecord(code: string) {
  const normalized = code.trim().toUpperCase()
  if (!normalized) return { success: false, error: 'Masukkan kode terlebih dahulu.' }

  const supabase = await createClient()

  if (normalized.startsWith('COTCH-') || normalized.startsWith('BKG-')) {
    const { data: booking } = await (supabase
      .from('bookings')
      .select('*')
      .eq('booking_code', normalized)
      .single() as any)

    if (!booking) return { success: false, error: 'Kode tidak ditemukan.' }

    const { data: table } = await (supabase
      .from('floor_tables')
      .select('section')
      .eq('id', (booking as { table_id: string }).table_id)
      .single() as any)

    return { success: true, type: 'booking', data: { ...booking, section: table?.section ?? null } }
  }

  if (normalized.startsWith('WL-')) {
    const { data, count } = await (supabase
      .from('waitlist')
      .select('*', { count: 'exact' })
      .eq('waitlist_code', normalized)
      .single() as any)

    if (!data) return { success: false, error: 'Kode tidak ditemukan.' }

    return { success: true, type: 'waitlist', data: { ...data, position: count ?? 1 } }
  }

  if (normalized.startsWith('ORD-')) {
    const { data } = await (supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_code', normalized)
      .single() as any)

    if (!data) return { success: false, error: 'Kode tidak ditemukan.' }

    return { success: true, type: 'order', data }
  }

  return { success: false, error: 'Format kode belum dikenali.' }
}

export async function cancelRecord(type: 'booking' | 'waitlist' | 'order', code: string) {
  const supabase = await createClient()
  const normalized = code.trim().toUpperCase()

  if (type === 'booking') {
    const { data } = await ((supabase.from('bookings') as any)
      .update({ status: 'cancelled' })
      .eq('booking_code', normalized)
      .eq('status', 'active')
      .select('id')
      .single() as any)

    return data ? { success: true } : { success: false, error: 'Booking tidak bisa dibatalkan.' }
  }

  if (type === 'waitlist') {
    const { data } = await ((supabase.from('waitlist') as any)
      .update({ status: 'cancelled' })
      .eq('waitlist_code', normalized)
      .eq('status', 'waiting')
      .select('id')
      .single() as any)

    return data ? { success: true } : { success: false, error: 'Waitlist tidak bisa dibatalkan.' }
  }

  const { data } = await ((supabase.from('orders') as any)
    .update({ status: 'cancelled' })
    .eq('order_code', normalized)
    .in('status', ['pending', 'confirmed'])
    .select('id')
    .single() as any)

  return data ? { success: true } : { success: false, error: 'Order tidak bisa dibatalkan.' }
}
