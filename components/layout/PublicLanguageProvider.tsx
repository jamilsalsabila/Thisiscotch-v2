'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { PublicLang } from '@/lib/server-lang'

const PublicLanguageContext = createContext<PublicLang>('en')

export function PublicLanguageProvider({
  initialLang,
  children,
}: {
  initialLang: PublicLang
  children: React.ReactNode
}) {
  const [lang, setLang] = useState<PublicLang>(initialLang)

  useEffect(() => {
    const applyLang = (value?: string) => {
      setLang(value === 'id' ? 'id' : 'en')
    }

    applyLang(localStorage.getItem('cotch_lang') || initialLang)

    const onLangChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ lang?: string } | string>).detail
      if (typeof detail === 'string') {
        applyLang(detail)
        return
      }
      applyLang(detail?.lang || localStorage.getItem('cotch_lang') || initialLang)
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'cotch_lang') return
      applyLang(event.newValue || initialLang)
    }

    document.addEventListener('langChanged', onLangChanged)
    window.addEventListener('storage', onStorage)
    return () => {
      document.removeEventListener('langChanged', onLangChanged)
      window.removeEventListener('storage', onStorage)
    }
  }, [initialLang])

  return (
    <PublicLanguageContext.Provider value={lang}>
      {children}
    </PublicLanguageContext.Provider>
  )
}

export function usePublicLanguage() {
  return useContext(PublicLanguageContext)
}
