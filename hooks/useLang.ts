'use client'

import { useEffect, useState } from 'react'
import { translations, type Lang, type TranslationKey } from '@/lib/translations'

export function useLang() {
  const [lang, setLang] = useState<Lang>('id')

  useEffect(() => {
    const saved = localStorage.getItem('lang')
    if (saved === 'en' || saved === 'id') setLang(saved)

    // storage event fires for OTHER tabs only
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'lang' && (e.newValue === 'en' || e.newValue === 'id')) {
        setLang(e.newValue)
      }
    }
    // custom event fires for the SAME tab (dispatched by Navbar)
    const onLangChanged = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail
      if (detail === 'en' || detail === 'id') setLang(detail)
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('cotch:lang', onLangChanged)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('cotch:lang', onLangChanged)
    }
  }, [])

  function t(key: TranslationKey): string {
    return (translations[lang] as Record<string, string>)[key]
      ?? (translations.id as Record<string, string>)[key]
      ?? key
  }

  return { lang, t }
}
