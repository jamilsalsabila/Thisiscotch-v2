import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

function normalizeEnvValue(value: string | undefined) {
  const trimmed = value?.trim() ?? ''
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

function getPublicSupabaseEnv() {
  return {
    url: normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  }
}

function getAdminSupabaseEnv() {
  return {
    ...getPublicSupabaseEnv(),
    serviceRoleKey:
      normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
      normalizeEnvValue(process.env.SUPABASE_SERVICE_KEY) ||
      normalizeEnvValue(process.env.SUPABASE_SECRET_KEY) ||
      normalizeEnvValue(process.env.SUPABASE_SECRET),
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
    throw new Error('Supabase admin environment variables are required. Checked SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SERVICE_KEY, SUPABASE_SECRET_KEY, and SUPABASE_SECRET.')
  }

  return createClient(
    url,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
