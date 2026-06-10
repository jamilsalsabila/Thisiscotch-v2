'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { requireAdminAccess } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/database'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { DEFAULT_MENU_CATEGORIES } from '@/lib/site'

const MENU_UPLOAD_DIR = path.join(process.cwd(), 'public/assets/images/menu')
const GALLERY_UPLOAD_DIR = path.join(process.cwd(), 'public/assets/images/gallery')
const HERO_UPLOAD_DIR = path.join(process.cwd(), 'public/assets/images')
const REVIEW_UPLOAD_DIR = path.join(process.cwd(), 'public/assets/images/reviews')
const MENU_UPLOAD_URL = '/assets/images/menu/'
const GALLERY_UPLOAD_URL = '/assets/images/gallery/'
const HERO_UPLOAD_URL = '/assets/images/'
const REVIEW_UPLOAD_URL = '/assets/images/reviews/'

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true })
}

async function saveUploadedImage(file: File | null, dir: string, urlBase: string, prefix: string) {
  if (!file || file.size === 0) return ''

  const ext = (file.name.split('.').pop() || '').toLowerCase()
  if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    throw new Error(`Format .${ext || 'unknown'} tidak didukung.`)
  }

  await ensureDir(dir)
  const bytes = Buffer.from(await file.arrayBuffer())
  const name = `${prefix}_${randomBytes(6).toString('hex')}.${ext}`
  await writeFile(path.join(dir, name), bytes)
  return `${urlBase}${name}`
}

async function deleteLocalImage(imagePath: string | null | undefined, urlBase: string, dir: string) {
  if (!imagePath || !imagePath.startsWith(urlBase)) return
  const file = path.basename(imagePath)
  try {
    await unlink(path.join(dir, file))
  } catch {}
}

// ── Bookings ──────────────────────────────────────────────────────
export async function updateBookingStatus(id: number, status: string) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  await supabase.from('bookings').update({ status, is_seen: true }).eq('id', id)
  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
}

export async function markBookingSeen(id: number) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  await supabase.from('bookings').update({ is_seen: true }).eq('id', id)
  revalidatePath('/admin/bookings')
}

// ── Orders ────────────────────────────────────────────────────────
export async function updateOrderStatus(id: number, status: string) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  await supabase.from('orders').update({ status }).eq('id', id)
  revalidatePath('/admin/bookings')
  revalidatePath('/admin/orders')
  revalidatePath('/admin')
}

// ── Waitlist ──────────────────────────────────────────────────────
export async function updateWaitlistStatus(id: number, status: string) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  await supabase.from('waitlist').update({ status }).eq('id', id)
  revalidatePath('/admin/bookings')
  revalidatePath('/admin/waitlist')
  revalidatePath('/admin')
}

// ── Reviews ───────────────────────────────────────────────────────
export async function publishReview(id: number, publish: boolean) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  await supabase.from('reviews').update({ is_published: publish }).eq('id', id)
  revalidatePath('/admin/reviews')
  revalidatePath('/reviews')
}

export async function toggleReviewFeatured(id: number, featured: boolean) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  await (supabase.from('reviews') as any).update({ is_featured: featured }).eq('id', id)
  revalidatePath('/admin/reviews')
  revalidatePath('/reviews')
  revalidatePath('/')
}

export async function saveReviewReply(id: number, reply: string) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  const cleaned = reply.trim()
  await (supabase.from('reviews') as any).update({
    admin_reply: cleaned || null,
    admin_reply_at: cleaned ? new Date().toISOString() : null,
  }).eq('id', id)
  revalidatePath('/admin/reviews')
  revalidatePath('/reviews')
}

export async function deleteReview(id: number) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  const { data: existing } = await (supabase.from('reviews').select('photos_json, photos').eq('id', id).single() as any)
  const rawPhotos = existing?.photos_json ?? existing?.photos
  const photos = Array.isArray(rawPhotos)
    ? rawPhotos
    : typeof rawPhotos === 'string'
      ? (() => {
          try {
            return JSON.parse(rawPhotos)
          } catch {
            return []
          }
        })()
      : []

  await (supabase.from('reviews') as any).delete().eq('id', id)

  for (const photo of (photos as string[])) {
    await deleteLocalImage(photo, REVIEW_UPLOAD_URL, REVIEW_UPLOAD_DIR)
  }

  revalidatePath('/admin/reviews')
  revalidatePath('/reviews')
}

// ── Menu ──────────────────────────────────────────────────────────
export async function toggleMenuAvailable(id: number, val: boolean) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  await supabase.from('menu_items').update({ is_available: val }).eq('id', id)
  revalidatePath('/admin/menu')
  revalidatePath('/order')
}

export async function toggleMenuFeatured(id: number, val: boolean) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  await supabase.from('menu_items').update({ is_featured: val }).eq('id', id)
  revalidatePath('/admin/menu')
  revalidatePath('/')
}

export async function upsertMenuItem(data: {
  id?: number
  name_id: string
  name_en: string
  description_id: string
  description_en: string
  category: string
  subcategory: string
  price: number
  image?: string | null
  is_available: boolean
  is_featured: boolean
  sort_order: number
}) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  if (data.id) {
    const { id, ...rest } = data
    await supabase.from('menu_items').update(rest).eq('id', id)
  } else {
    const { id, ...rest } = data
    await supabase.from('menu_items').insert(rest)
  }
  revalidatePath('/admin/menu')
  revalidatePath('/order')
  revalidatePath('/')
}

export async function deleteMenuItem(id: number) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  const { data: existing } = await (supabase.from('menu_items').select('image').eq('id', id).single() as any)
  await supabase.from('menu_items').delete().eq('id', id)
  await deleteLocalImage(existing?.image, MENU_UPLOAD_URL, MENU_UPLOAD_DIR)
  revalidatePath('/admin/menu')
  revalidatePath('/order')
}

export async function deleteMenuItems(ids: number[]) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  if (!ids.length) return
  const { data: existing } = await (supabase.from('menu_items').select('image').in('id', ids) as any)
  await supabase.from('menu_items').delete().in('id', ids)
  for (const item of ((existing as Array<{ image: string | null }> | null) ?? [])) {
    await deleteLocalImage(item.image, MENU_UPLOAD_URL, MENU_UPLOAD_DIR)
  }
  revalidatePath('/admin/menu')
  revalidatePath('/order')
}

export async function saveMenuItemForm(formData: FormData) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  const idValue = Number(formData.get('id') ?? 0)
  const imageFile = formData.get('image')
  const imageUrl = String(formData.get('image_url') ?? '').trim()
  const uploaded = imageFile instanceof File ? await saveUploadedImage(imageFile, MENU_UPLOAD_DIR, MENU_UPLOAD_URL, 'menu') : ''

  let existingImage = ''
  if (idValue) {
    const { data } = await (supabase.from('menu_items').select('image').eq('id', idValue).single() as any)
    existingImage = data?.image ?? ''
  }

  const finalImage = uploaded || imageUrl || existingImage || null

  await upsertMenuItem({
    id: idValue || undefined,
    name_id: String(formData.get('name_id') ?? '').trim(),
    name_en: String(formData.get('name_en') ?? '').trim(),
    description_id: String(formData.get('description_id') ?? '').trim(),
    description_en: String(formData.get('description_en') ?? '').trim(),
    category: String(formData.get('category') ?? 'drink'),
    subcategory: String(formData.get('subcategory') ?? 'coffee'),
    price: Number(formData.get('price') ?? 0),
    image: finalImage,
    is_available: formData.get('is_available') === 'on',
    is_featured: formData.get('is_featured') === 'on',
    sort_order: Number(formData.get('sort_order') ?? 0),
  })

  if (idValue && uploaded && existingImage && existingImage !== uploaded) {
    await deleteLocalImage(existingImage, MENU_UPLOAD_URL, MENU_UPLOAD_DIR)
  }
}

// ── Site Settings ─────────────────────────────────────────────────
export async function saveSiteSettings(settings: Record<string, string>) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  const rows: Database['public']['Tables']['site_settings']['Insert'][] = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }))
  await (supabase.from('site_settings') as any).upsert(rows)
  revalidatePath('/admin/settings')
  revalidatePath('/admin/schedule')
  revalidatePath('/admin/categories')
  revalidatePath('/')
  revalidatePath('/about')
  revalidatePath('/menu')
  revalidatePath('/order')
}

export async function saveSiteSettingsForm(formData: FormData) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  const photoMain = formData.get('photo_main')
  const photoFloat = formData.get('photo_float')
  const heroMainInput = String(formData.get('hero_img_main') ?? '').trim()
  const heroFloatInput = String(formData.get('hero_img_float') ?? '').trim()

  const { data } = await (supabase.from('site_settings').select('key, value').in('key', ['hero_img_main', 'hero_img_float']) as any)
  const existing = new Map((((data as Array<{ key: string; value: string }> | null) ?? []).map(item => [item.key, item.value])))

  const uploadedMain = photoMain instanceof File ? await saveUploadedImage(photoMain, HERO_UPLOAD_DIR, HERO_UPLOAD_URL, 'hero_img_main') : ''
  const uploadedFloat = photoFloat instanceof File ? await saveUploadedImage(photoFloat, HERO_UPLOAD_DIR, HERO_UPLOAD_URL, 'hero_img_float') : ''
  const currentMain = existing.get('hero_img_main') ?? ''
  const currentFloat = existing.get('hero_img_float') ?? ''
  const nextMain = uploadedMain || heroMainInput || currentMain
  const nextFloat = uploadedFloat || heroFloatInput || currentFloat

  await saveSiteSettings({
    hero_img_main: nextMain,
    hero_img_float: nextFloat,
  })

  if (uploadedMain && currentMain && currentMain !== uploadedMain) {
    await deleteLocalImage(currentMain, HERO_UPLOAD_URL, HERO_UPLOAD_DIR)
  }
  if (uploadedFloat && currentFloat && currentFloat !== uploadedFloat) {
    await deleteLocalImage(currentFloat, HERO_UPLOAD_URL, HERO_UPLOAD_DIR)
  }
}

// ── Gallery ───────────────────────────────────────────────────────
export async function upsertGalleryItem(data: {
  id?: number
  src: string
  alt_id: string
  alt_en: string
  section: string
  sort_order: number
  is_active: boolean
}) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  if (data.id) {
    const { id, ...rest } = data
    await (supabase.from('gallery_items') as any).update(rest).eq('id', id)
  } else {
    await (supabase.from('gallery_items') as any).insert([data])
  }
  revalidatePath('/admin/gallery')
  revalidatePath('/')
  revalidatePath('/gallery')
  revalidatePath('/about')
}

export async function deleteGalleryItem(id: number) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  const { data: existing } = await (supabase.from('gallery_items').select('src').eq('id', id).single() as any)
  await (supabase.from('gallery_items') as any).delete().eq('id', id)
  await deleteLocalImage(existing?.src, GALLERY_UPLOAD_URL, GALLERY_UPLOAD_DIR)
  revalidatePath('/admin/gallery')
  revalidatePath('/')
  revalidatePath('/gallery')
}

export async function deleteGalleryItems(ids: number[]) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  if (!ids.length) return
  const { data: existing } = await (supabase.from('gallery_items').select('src').in('id', ids) as any)
  await (supabase.from('gallery_items') as any).delete().in('id', ids)
  for (const item of ((existing as Array<{ src: string }> | null) ?? [])) {
    await deleteLocalImage(item.src, GALLERY_UPLOAD_URL, GALLERY_UPLOAD_DIR)
  }
  revalidatePath('/admin/gallery')
  revalidatePath('/')
  revalidatePath('/gallery')
}

export async function toggleGalleryActive(id: number, isActive: boolean) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  await (supabase.from('gallery_items') as any).update({ is_active: isActive }).eq('id', id)
  revalidatePath('/admin/gallery')
  revalidatePath('/')
  revalidatePath('/gallery')
}

export async function saveGalleryItemForm(formData: FormData) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  const idValue = Number(formData.get('id') ?? 0)
  const imageFile = formData.get('image')
  const imageUrl = String(formData.get('src') ?? '').trim()
  const uploaded = imageFile instanceof File ? await saveUploadedImage(imageFile, GALLERY_UPLOAD_DIR, GALLERY_UPLOAD_URL, 'gallery') : ''

  let existingSrc = ''
  if (idValue) {
    const { data } = await (supabase.from('gallery_items').select('src').eq('id', idValue).single() as any)
    existingSrc = data?.src ?? ''
  }

  const finalSrc = uploaded || imageUrl || existingSrc
  if (!finalSrc) {
    throw new Error('Pilih file atau masukkan URL gambar.')
  }

  await upsertGalleryItem({
    id: idValue || undefined,
    src: finalSrc,
    alt_id: String(formData.get('alt_id') ?? '').trim(),
    alt_en: String(formData.get('alt_en') ?? '').trim(),
    section: String(formData.get('section') ?? 'indoor'),
    sort_order: Number(formData.get('sort_order') ?? 0),
    is_active: formData.get('is_active') === 'on',
  })

  if (idValue && uploaded && existingSrc && existingSrc !== uploaded) {
    await deleteLocalImage(existingSrc, GALLERY_UPLOAD_URL, GALLERY_UPLOAD_DIR)
  }
}

export async function saveGalleryItemsForm(formData: FormData) {
  await requireAdminAccess()
  const files = formData.getAll('images').filter(item => item instanceof File) as File[]
  const imageUrl = String(formData.get('src') ?? '').trim()
  const altId = String(formData.get('alt_id') ?? '').trim()
  const altEn = String(formData.get('alt_en') ?? '').trim()
  const section = String(formData.get('section') ?? 'indoor')
  const startSort = Number(formData.get('sort_order') ?? 0)
  const isActive = formData.get('is_active') === 'on'

  if (!files.length && !imageUrl) {
    throw new Error('Pilih file atau masukkan URL gambar.')
  }

  if (!files.length && imageUrl) {
    await upsertGalleryItem({
      src: imageUrl,
      alt_id: altId,
      alt_en: altEn,
      section,
      sort_order: startSort,
      is_active: isActive,
    })
    return
  }

  let sortOrder = startSort
  for (const file of files) {
    const uploaded = await saveUploadedImage(file, GALLERY_UPLOAD_DIR, GALLERY_UPLOAD_URL, 'gallery')
    const baseName = file.name.replace(/\.[^.]+$/, '')
    await upsertGalleryItem({
      src: uploaded,
      alt_id: altId || altEn || baseName,
      alt_en: altEn || altId || baseName,
      section,
      sort_order: sortOrder,
      is_active: isActive,
    })
    sortOrder += 1
  }
}

export async function moveGalleryItem(id: number, direction: 'up' | 'down') {
  await requireAdminAccess()
  const supabase = createAdminClient()
  const { data: items } = await (supabase.from('gallery_items').select('*').order('sort_order').order('id') as any)
  const rows = (items as Array<{ id: number; sort_order: number }> | null) ?? []
  const index = rows.findIndex(item => item.id === id)
  if (index === -1) return

  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= rows.length) return

  const current = rows[index]
  const target = rows[swapIndex]

  await (supabase.from('gallery_items') as any).update({ sort_order: target.sort_order }).eq('id', current.id)
  await (supabase.from('gallery_items') as any).update({ sort_order: current.sort_order }).eq('id', target.id)

  revalidatePath('/admin/gallery')
  revalidatePath('/')
  revalidatePath('/gallery')
}

// ── Categories ────────────────────────────────────────────────────
type MenuCategory = {
  label_en: string
  label_id: string
  subs: string[]
}

async function getStoredCategories() {
  const supabase = createAdminClient()
  const { data } = await (supabase.from('site_settings').select('value').eq('key', 'menu_categories').single() as any)
  const raw = data?.value
  if (!raw) {
    return DEFAULT_MENU_CATEGORIES
  }
  try {
    return {
      ...DEFAULT_MENU_CATEGORIES,
      ...(JSON.parse(raw) as Record<string, MenuCategory>),
    }
  } catch {
    return DEFAULT_MENU_CATEGORIES
  }
}

async function persistCategories(categories: Record<string, MenuCategory>) {
  await saveSiteSettings({ menu_categories: JSON.stringify(categories) })
}

export async function addMenuCategory(input: { slug: string; label_en: string; label_id: string }) {
  await requireAdminAccess()
  const categories = await getStoredCategories()
  const slug = input.slug.trim().toLowerCase()
  categories[slug] = { label_en: input.label_en.trim(), label_id: input.label_id.trim(), subs: [] }
  await persistCategories(categories)
}

export async function updateMenuCategory(input: { oldSlug: string; newSlug: string; label_en: string; label_id: string }) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  const categories = await getStoredCategories()
  const current = categories[input.oldSlug]
  if (!current) return

  const nextSlug = input.newSlug.trim().toLowerCase()
  const updated: MenuCategory = {
    label_en: input.label_en.trim(),
    label_id: input.label_id.trim(),
    subs: current.subs,
  }

  if (nextSlug !== input.oldSlug) {
    const rebuilt: Record<string, MenuCategory> = {}
    Object.entries(categories).forEach(([slug, value]) => {
      rebuilt[slug === input.oldSlug ? nextSlug : slug] = slug === input.oldSlug ? updated : value
    })
    await (supabase.from('menu_items') as any).update({ category: nextSlug }).eq('category', input.oldSlug)
    await persistCategories(rebuilt)
    return
  }

  categories[input.oldSlug] = updated
  await persistCategories(categories)
}

export async function deleteMenuCategory(slug: string) {
  await requireAdminAccess()
  const categories = await getStoredCategories()
  delete categories[slug]
  await persistCategories(categories)
}

export async function addMenuSubcategory(input: { slug: string; sub: string }) {
  await requireAdminAccess()
  const categories = await getStoredCategories()
  const category = categories[input.slug]
  if (!category) return
  const sub = input.sub.trim().toLowerCase()
  if (!sub || category.subs.includes(sub)) return
  category.subs.push(sub)
  await persistCategories(categories)
}

export async function deleteMenuSubcategory(input: { slug: string; sub: string }) {
  await requireAdminAccess()
  const categories = await getStoredCategories()
  const category = categories[input.slug]
  if (!category) return
  category.subs = category.subs.filter(item => item !== input.sub)
  await persistCategories(categories)
}
