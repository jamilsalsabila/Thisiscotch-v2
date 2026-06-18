'use server'

import { createClient } from '@/lib/supabase/server'
import { generateCode } from '@/utils/format'
import type { Database } from '@/types/database'

const NON_BLOCKING_BOOKING_STATUSES = new Set([
  '',
  'cancelled',
  'canceled',
  'complete',
  'completed',
  'done',
  'closed',
  'expired',
  'no-show',
  'no_show',
  'noshow',
])

function blocksTable(status: string | null | undefined) {
  return !NON_BLOCKING_BOOKING_STATUSES.has(String(status ?? '').trim().toLowerCase())
}

export async function createBooking(data: {
  tableId: string
  section: Database['public']['Tables']['floor_tables']['Row']['section']
  capacity: number
  guestName: string
  guestPhone: string
  guestEmail: string
  partySize: number
  bookingDate: string
  bookingTime: string
  specialRequest: string
}): Promise<{ success: boolean; bookingCode?: string; error?: string }> {
  const supabase = await createClient()
  const bookingCode = generateCode('COTCH')

  if (data.bookingDate < new Date().toISOString().split('T')[0]) {
    return { success: false, error: 'Cannot book a past date.' }
  }

  if (data.partySize > data.capacity) {
    return { success: false, error: `Party size exceeds table capacity (${data.capacity}).` }
  }

  const { data: activeBookings } = await ((supabase
    .from('bookings')
    .select('table_id, booking_time, status')
    .eq('booking_date', data.bookingDate)
    .eq('table_id', data.tableId)) as any)

  const requestedMinutes = toMinutes(data.bookingTime)
  const overlaps = ((activeBookings as Array<{ booking_time: string; status?: string | null }> | null) ?? [])
    .filter(booking => blocksTable(booking.status))
    .some(booking => {
      const existingMinutes = toMinutes(booking.booking_time)
      return Math.abs(existingMinutes - requestedMinutes) < 120
    })

  if (overlaps) {
    return { success: false, error: 'This table is already booked for the selected time.' }
  }

  const payload: Database['public']['Tables']['bookings']['Insert'] = {
    booking_code: bookingCode,
    table_id: data.tableId,
    guest_name: data.guestName,
    guest_phone: data.guestPhone,
    guest_email: data.guestEmail || null,
    party_size: data.partySize,
    booking_date: data.bookingDate,
    booking_time: data.bookingTime,
    special_request: data.specialRequest || null,
    status: 'active',
    is_seen: false,
  }

  const { error } = await (supabase.from('bookings') as any).insert([payload])

  if (error) return { success: false, error: error.message }
  return { success: true, bookingCode }
}

export async function getBookedTableIds(date: string, time: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await ((supabase
    .from('bookings')
    .select('table_id, booking_time, status')
    .eq('booking_date', date)) as any)
  const requestedMinutes = toMinutes(time)
  return ((data as Array<{ table_id: string; booking_time: string }> | null) ?? [])
    .filter(booking => blocksTable((booking as { status?: string | null }).status))
    .filter(booking => Math.abs(toMinutes(booking.booking_time) - requestedMinutes) < 120)
    .map(booking => booking.table_id)
}

function toMinutes(time: string) {
  const [hour, minute] = time.slice(0, 5).split(':').map(Number)
  return (hour * 60) + minute
}
