import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ''

  if (!url || !anonKey) {
    throw new Error('Supabase public environment variables are required.')
  }

  return createBrowserClient<Database>(
    url,
    anonKey
  )
}
