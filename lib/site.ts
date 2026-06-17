import { unstable_cache } from 'next/cache'
import { createAdminClient, hasAdminSupabaseEnv } from '@/lib/supabase/server'

export const DEFAULT_SITE = {
  siteName: 'Cotch',
  whatsappNumber: '628161617181',
  whatsappMessage: 'Hi Cotch! I have a question.',
  locationId: 'Jl. L.L.R.E. Martadinata No. 221, Cihapit, Bandung Wetan, Kota Bandung, Jawa Barat 40114',
  locationEn: 'LLRE Martadinata St No. 221, Cihapit, Bandung Wetan, Bandung City, West Java 40114',
  mapsEmbedUrl: 'https://maps.google.com/maps?q=Jl.+LLRE+Martadinata+No.221,+Cihapit,+Bandung+Wetan,+Bandung&z=16&output=embed',
  mapsLink: 'https://maps.google.com/?q=Jl.+LLRE+Martadinata+No.221,+Cihapit,+Bandung+Wetan,+Bandung',
  openTime: '12:00',
  closeTime: '21:00',
  daysText: 'Mon – Sun',
  daysTextId: 'Sen – Min',
  closedDays: [] as number[],
  socialInstagram: 'https://instagram.com/cotchbandung',
  socialTiktok: 'https://tiktok.com/@cotchbandung',
  socialTwitter: 'https://x.com/cotchbandung',
  heroImgMain: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  heroImgFloat: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80',
}

type DailySchedule = Record<string, { is_open?: boolean; open?: string; close?: string }>

type MenuCategory = {
  label_en: string
  label_id: string
  subs: string[]
}

export const DEFAULT_MENU_CATEGORIES: Record<string, MenuCategory> = {
  food: { label_en: 'Food', label_id: 'Makanan', subs: ['main', 'side'] },
  'coffee-signatures': {
    label_en: 'Coffee Signatures',
    label_id: 'Signature Coffee',
    subs: ['coffee classic', 'cotch signature', 'coffee signature'],
  },
  'tea-collection': {
    label_en: 'Tea Collection',
    label_id: 'Koleksi Teh',
    subs: ['artisan tea', 'flavored tea', 'japanese tea'],
  },
  refreshing: {
    label_en: 'Refreshing',
    label_id: 'Minuman Segar',
    subs: ['smoothie', 'fresh juice', 'sparkling drink'],
  },
  'creamy-delights': {
    label_en: 'Creamy Delights',
    label_id: 'Creamy Delights',
    subs: ['milkshake', 'float', 'chocolate'],
  },
  beverages: {
    label_en: 'Beverages',
    label_id: 'Minuman Lainnya',
    subs: ['21+', 'soft drink'],
  },
  drink: { label_en: 'Drinks', label_id: 'Minuman', subs: ['coffee', 'signature', 'non-coffee', 'cold'] },
  pastry: { label_en: 'Pastry', label_id: 'Pastri', subs: ['cake', 'bread'] },
}

export type SiteData = typeof DEFAULT_SITE & {
  isOpen: boolean
  activeDays: number
  socialWhatsapp: string
  visitorCount: number
  menuCategories: Record<string, MenuCategory>
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
  const weekdayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  }

  return {
    isoDay: weekdayMap[get('weekday')] ?? 1,
    time: `${get('hour')}:${get('minute')}`,
  }
}

function safeJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function computeOpenState(settings: Map<string, string>) {
  const { isoDay, time } = jakartaNow()
  const schedule = safeJson<DailySchedule>(settings.get('daily_schedule'), {})
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

function computeActiveDays(settings: Map<string, string>) {
  const schedule = safeJson<DailySchedule>(settings.get('daily_schedule'), {})
  const scheduleKeys = Object.keys(schedule)

  if (scheduleKeys.length > 0) {
    return scheduleKeys.reduce((sum, key) => sum + (schedule[key]?.is_open === false ? 0 : 1), 0)
  }

  const closedDays = safeJson<number[]>(settings.get('closed_days'), DEFAULT_SITE.closedDays)
  return Math.max(0, 7 - closedDays.length)
}

export const getSiteData = unstable_cache(
  async (): Promise<SiteData> => {
    try {
      if (!hasAdminSupabaseEnv()) {
        return {
          ...DEFAULT_SITE,
          isOpen: true,
          activeDays: 7,
          socialWhatsapp: `https://wa.me/${DEFAULT_SITE.whatsappNumber}`,
          visitorCount: 0,
          menuCategories: DEFAULT_MENU_CATEGORIES,
        }
      }

      const supabase = createAdminClient()
      const { data } = await (supabase.from('site_settings').select('key, value') as any)
      const settings = new Map(((data as Array<{ key: string; value: string }> | null) ?? []).map(item => [item.key, item.value]))

      const menuCategories = {
        ...DEFAULT_MENU_CATEGORIES,
        ...safeJson<Record<string, MenuCategory>>(settings.get('menu_categories'), DEFAULT_MENU_CATEGORIES),
      }
      const { data: visitors } = await (supabase.from('visitors').select('count') as any)
      const visitorCount = Array.isArray(visitors)
        ? visitors.reduce((sum: number, row: { count?: number | string | null }) => sum + Number(row?.count ?? 0), 0)
        : 0

      return {
        siteName: settings.get('site_name') ?? DEFAULT_SITE.siteName,
        whatsappNumber: settings.get('whatsapp_number') ?? DEFAULT_SITE.whatsappNumber,
        whatsappMessage: settings.get('whatsapp_message') ?? DEFAULT_SITE.whatsappMessage,
        locationId: settings.get('location_id') ?? DEFAULT_SITE.locationId,
        locationEn: settings.get('location_en') ?? DEFAULT_SITE.locationEn,
        mapsEmbedUrl: DEFAULT_SITE.mapsEmbedUrl,
        mapsLink: settings.get('maps_link') ?? DEFAULT_SITE.mapsLink,
        openTime: settings.get('open_time') ?? DEFAULT_SITE.openTime,
        closeTime: settings.get('close_time') ?? DEFAULT_SITE.closeTime,
        daysText: settings.get('days_text') ?? DEFAULT_SITE.daysText,
        daysTextId: settings.get('days_text_id') ?? DEFAULT_SITE.daysTextId,
        closedDays: safeJson<number[]>(settings.get('closed_days'), DEFAULT_SITE.closedDays),
        socialInstagram: settings.get('social_instagram') ?? DEFAULT_SITE.socialInstagram,
        socialTiktok: settings.get('social_tiktok') ?? DEFAULT_SITE.socialTiktok,
        socialTwitter: settings.get('social_twitter') ?? DEFAULT_SITE.socialTwitter,
        heroImgMain: settings.get('hero_img_main') ?? DEFAULT_SITE.heroImgMain,
        heroImgFloat: settings.get('hero_img_float') ?? DEFAULT_SITE.heroImgFloat,
        isOpen: computeOpenState(settings),
        activeDays: computeActiveDays(settings),
        socialWhatsapp: `https://wa.me/${settings.get('whatsapp_number') ?? DEFAULT_SITE.whatsappNumber}`,
        visitorCount,
        menuCategories,
      }
    } catch {
      return {
        ...DEFAULT_SITE,
        isOpen: true,
        activeDays: 7,
        socialWhatsapp: `https://wa.me/${DEFAULT_SITE.whatsappNumber}`,
        visitorCount: 0,
        menuCategories: DEFAULT_MENU_CATEGORIES,
      }
    }
  },
  ['site_data'],
  { revalidate: 120 }
)
