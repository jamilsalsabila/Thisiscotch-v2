import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  const normalizeEnvValue = (value: string | undefined) => {
    const trimmed = value?.trim() ?? ''
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1).trim()
    }
    return trimmed
  }

  const url = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anonKey =
    normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!url || !anonKey) {
    throw new Error('Supabase public environment variables are required.')
  }

  return createBrowserClient<Database>(
    url,
    anonKey
  )
}
