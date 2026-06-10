import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

function getPublicSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '',
  }
}

function getAdminSupabaseEnv() {
  return {
    ...getPublicSupabaseEnv(),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '',
  }
}

export function hasPublicSupabaseEnv() {
  const { url, anonKey } = getPublicSupabaseEnv()
  return Boolean(url && anonKey)
}

export function hasAdminSupabaseEnv() {
  const { url, serviceRoleKey } = getAdminSupabaseEnv()
  return Boolean(url && serviceRoleKey)
}

export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getPublicSupabaseEnv()

  if (!url || !anonKey) {
    throw new Error('Supabase public environment variables are required.')
  }

  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

/** Pakai service role — hanya di server, untuk operasi admin */
export function createAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  const { url, serviceRoleKey } = getAdminSupabaseEnv()

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase admin environment variables are required.')
  }

  return createClient(
    url,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
