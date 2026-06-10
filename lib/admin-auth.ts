import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_COOKIE = 'cotch_admin'
const ADMIN_FAILS_COOKIE = 'cotch_admin_fails'
const ADMIN_LOCK_COOKIE = 'cotch_admin_lock'
const DEFAULT_ADMIN_PASSWORD = 'cotch@dmin25'

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD
}

function getAdminSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() || `${getAdminPassword()}:cotch:admin`
}

function createAdminToken() {
  return createHmac('sha256', getAdminSecret())
    .update(`admin:${getAdminPassword()}`)
    .digest('hex')
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

function parseCookieNumber(value: string | undefined) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!token) return false
  return safeEqual(token, createAdminToken())
}

export async function requireAdminAccess() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login')
  }
}

export async function createAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  cookieStore.delete(ADMIN_FAILS_COOKIE)
  cookieStore.delete(ADMIN_LOCK_COOKIE)
}

export async function destroyAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
  cookieStore.delete(ADMIN_FAILS_COOKIE)
  cookieStore.delete(ADMIN_LOCK_COOKIE)
}

function lockoutMessage(until: number) {
  const wait = Math.max(1, Math.ceil((until - Date.now()) / 60000))
  return `Too many failed attempts. Try again in ${wait} minute(s).`
}

export async function loginAdmin(formData: FormData) {
  const cookieStore = await cookies()
  const password = String(formData.get('password') ?? '')
  const lockoutUntil = parseCookieNumber(cookieStore.get(ADMIN_LOCK_COOKIE)?.value)

  if (lockoutUntil > Date.now()) {
    redirect(`/admin/login?error=${encodeURIComponent(lockoutMessage(lockoutUntil))}`)
  }

  if (safeEqual(password, getAdminPassword())) {
    await createAdminSession()
    redirect('/admin')
  }

  const nextFails = parseCookieNumber(cookieStore.get(ADMIN_FAILS_COOKIE)?.value) + 1

  if (nextFails >= 5) {
    const until = Date.now() + (5 * 60 * 1000)
    cookieStore.set(ADMIN_LOCK_COOKIE, String(until), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 5 * 60,
    })
    cookieStore.delete(ADMIN_FAILS_COOKIE)
    redirect('/admin/login?error=Too%20many%20failed%20attempts.%20Locked%20for%205%20minutes.')
  }

  cookieStore.set(ADMIN_FAILS_COOKIE, String(nextFails), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })

  const remaining = 5 - nextFails
  redirect(`/admin/login?error=${encodeURIComponent(`Incorrect password. ${remaining} attempt(s) remaining.`)}`)
}

export async function logoutAdmin() {
  await destroyAdminSession()
  redirect('/admin/login')
}
