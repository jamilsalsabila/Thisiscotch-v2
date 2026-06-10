'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { generateCode } from '@/utils/format'
import type { Database } from '@/types/database'
import { DEFAULT_SITE } from '@/lib/site'
import { sendOrderNotification } from '@/lib/mailer'

type CartItem = { id: number; name: string; price: number; quantity: number }

export async function createOrder(data: {
  guestName: string
  guestPhone: string
  tableNumber: string
  notes: string
  items: CartItem[]
}): Promise<{ success: boolean; orderCode?: string; error?: string }> {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: settingsData } = await (admin
    .from('site_settings')
    .select('key, value')
    .in('key', ['daily_schedule', 'closed_days', 'open_time', 'close_time']) as any)

  const settings = new Map((((settingsData as Array<{ key: string; value: string }> | null) ?? []).map(item => [item.key, item.value])))
  if (!isCafeOpen(settings)) {
    return { success: false, error: 'Cafe sedang tutup. Order online hanya bisa dilakukan saat jam operasional.' }
  }

  if (data.items.length === 0) return { success: false, error: 'Your order is empty.' }

  const orderCode = generateCode('ORD')
  const totalAmount = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const orderPayload: Database['public']['Tables']['orders']['Insert'] = {
    order_code: orderCode,
    guest_name: data.guestName,
    guest_phone: data.guestPhone,
    table_number: data.tableNumber || null,
    notes: data.notes || null,
    total_amount: totalAmount,
    status: 'pending',
  }

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert([orderPayload] as any)
    .select('id')
    .single()

  if (orderErr || !order) return { success: false, error: orderErr?.message ?? 'Failed to create order.' }
  const createdOrder = order as { id: number }

  const orderItems: Database['public']['Tables']['order_items']['Insert'][] = data.items.map(i => ({
    order_id: createdOrder.id,
    menu_item_id: i.id,
    item_name: i.name,
    price: i.price,
    quantity: i.quantity,
    subtotal: i.price * i.quantity,
  }))

  const { error: itemsErr } = await (supabase.from('order_items') as any).insert(orderItems)
  if (itemsErr) return { success: false, error: itemsErr.message }

  void sendOrderNotification({
    order_code: orderCode,
    guest_name: data.guestName,
    guest_phone: data.guestPhone,
    table_number: data.tableNumber || null,
    notes: data.notes || null,
    total_amount: totalAmount,
    items: orderItems.map(item => ({
      item_name: item.item_name ?? '',
      quantity: item.quantity ?? 0,
      subtotal: item.subtotal ?? 0,
    })),
  })

  return { success: true, orderCode }
}

function safeJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function jakartaNow() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(new Date())
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? ''
  const weekdayMap: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }
  return { isoDay: weekdayMap[get('weekday')] ?? 1, time: `${get('hour')}:${get('minute')}` }
}

function isCafeOpen(settings: Map<string, string>) {
  const { isoDay, time } = jakartaNow()
  const schedule = safeJson<Record<string, { is_open?: boolean; open?: string; close?: string }>>(settings.get('daily_schedule'), {})
  const day = schedule[String(isoDay)]

  if (day) {
    if (!day.is_open) return false
    return time >= (day.open ?? DEFAULT_SITE.openTime) && time < (day.close ?? DEFAULT_SITE.closeTime)
  }

  const closedDays = safeJson<number[]>(settings.get('closed_days'), DEFAULT_SITE.closedDays)
  const openTime = settings.get('open_time') ?? DEFAULT_SITE.openTime
  const closeTime = settings.get('close_time') ?? DEFAULT_SITE.closeTime
  return !closedDays.includes(isoDay) && time >= openTime && time < closeTime
}
