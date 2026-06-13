import { cookies } from 'next/headers'

export type PublicLang = 'en' | 'id'

export async function getPublicLang(): Promise<PublicLang> {
  const cookieStore = await cookies()
  return cookieStore.get('cotch_lang')?.value === 'id' ? 'id' : 'en'
}
