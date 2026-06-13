'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    AOS?: { init: (options: Record<string, unknown>) => void; refreshHard?: () => void }
    Swiper?: new (selector: string | Element, options?: Record<string, unknown>) => unknown
    CountUp?: {
      CountUp: new (target: string, endVal: number, options?: Record<string, unknown>) => { start: () => void }
    }
    GLightbox?: (options: Record<string, unknown>) => { destroy?: () => void; reload?: () => void }
    showToast?: (msg: string, type?: 'success' | 'error' | 'info', duration?: number) => void
    openModal?: (id: string) => void
    closeModal?: (id: string) => void
    formatRp?: (amount: number | string) => string
    formatDateDisplay?: (dateStr: string) => string
  }
}

let galleryLightbox:
  | { destroy?: () => void; reload?: () => void }
  | null = null

export default function PublicEnhancements() {
  const pathname = usePathname()

  useEffect(() => {
    const applyLanguageToDom = (lang: 'en' | 'id') => {
      document.querySelectorAll<HTMLElement>('[data-copy-en]').forEach(node => {
        const next = lang === 'id' ? node.dataset.copyId : node.dataset.copyEn
        if (!next) return
        if (node.dataset.copyMode === 'html') {
          node.innerHTML = next
        } else {
          node.textContent = next
        }
      })

      document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-placeholder-en]').forEach(node => {
        const next = lang === 'id' ? node.dataset.placeholderId : node.dataset.placeholderEn
        if (next) node.placeholder = next
      })

      document.querySelectorAll<HTMLElement>('[data-title-en]').forEach(node => {
        const next = lang === 'id' ? node.dataset.titleId : node.dataset.titleEn
        if (next) node.setAttribute('title', next)
      })

      document.querySelectorAll<HTMLElement>('[data-aria-label-en]').forEach(node => {
        const next = lang === 'id' ? node.dataset.ariaLabelId : node.dataset.ariaLabelEn
        if (next) node.setAttribute('aria-label', next)
      })

      document.querySelectorAll<HTMLElement>('[data-alt-en]').forEach(node => {
        const next = lang === 'id' ? node.dataset.altId : node.dataset.altEn
        if (next) node.setAttribute('alt', next)
      })
    }

    const savedTheme = localStorage.getItem('cotch_theme') || 'light'
    document.documentElement.setAttribute('data-theme', savedTheme)

    const savedLang = localStorage.getItem('cotch_lang') || 'en'
    document.documentElement.lang = savedLang
    applyLanguageToDom(savedLang === 'id' ? 'id' : 'en')

    const applyResolvedLanguage = (value?: string) => {
      const normalized = value === 'id' ? 'id' : 'en'
      localStorage.setItem('cotch_lang', normalized)
      document.cookie = `cotch_lang=${normalized}; path=/; max-age=31536000; samesite=lax`
      document.documentElement.lang = normalized
      applyLanguageToDom(normalized)
      document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang: normalized } }))
    }

    const onLangChange = (event: Event) => {
      const custom = event as CustomEvent<string | { lang?: string }>
      const detail = custom.detail
      const lang = typeof detail === 'string' ? detail : detail?.lang
      applyResolvedLanguage(lang || localStorage.getItem('cotch_lang') || 'en')
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'cotch_lang') return
      applyResolvedLanguage(event.newValue || 'en')
    }

    window.addEventListener('cotch:lang', onLangChange as EventListener)
    window.addEventListener('storage', onStorage)
    applyResolvedLanguage(savedLang)

    window.showToast = (msg, type = 'info', duration = 3500) => {
      const wrap = document.getElementById('toastWrap')
      if (!wrap) return
      const icons = { success: '✓', error: '✕', info: 'ℹ' }
      const toast = document.createElement('div')
      toast.className = `toast toast--${type}`
      const iconEl = document.createElement('span')
      iconEl.className = 'toast__icon'
      iconEl.textContent = icons[type] || icons.info
      const msgEl = document.createElement('span')
      msgEl.className = 'toast__msg'
      msgEl.textContent = msg
      toast.append(iconEl, msgEl)
      wrap.appendChild(toast)
      window.setTimeout(() => {
        toast.classList.add('removing')
        window.setTimeout(() => toast.remove(), 300)
      }, duration)
    }

    window.openModal = (id: string) => {
      document.getElementById(id)?.classList.add('active')
      document.body.style.overflow = 'hidden'
    }

    window.closeModal = (id: string) => {
      document.getElementById(id)?.classList.remove('active')
      document.body.style.overflow = ''
    }

    window.formatRp = (amount: number | string) => `Rp ${Number(amount).toLocaleString('id-ID')}`
    window.formatDateDisplay = (dateStr: string) => {
      if (!dateStr) return ''
      return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    return () => {
      window.removeEventListener('cotch:lang', onLangChange as EventListener)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  useEffect(() => {
    const initAos = () => {
      if (!document.querySelector('[data-aos]')) {
        document.body.classList.add('aos-ready')
        return
      }
      if (!window.AOS) return
      window.AOS.init({
        duration: 650,
        once: true,
        offset: 60,
        easing: 'ease-out-cubic',
        disable: false,
      })
      window.AOS.refreshHard?.()
      document.body.classList.add('aos-ready')
    }

    const initCountUp = () => {
      if (!window.CountUp?.CountUp) return
      const targets = [
        { id: 'statTables', value: Number(document.getElementById('statTables')?.dataset.value || 0) },
        { id: 'statMenu', value: Number(document.getElementById('statMenu')?.dataset.value || 0) },
        { id: 'statDays', value: Number(document.getElementById('statDays')?.dataset.value || 0) },
      ]
      const options = { duration: 2, enableScrollSpy: true, scrollSpyOnce: true }
      targets.forEach(({ id, value }) => {
        if (!document.getElementById(id) || Number.isNaN(value) || value <= 0) return
        new window.CountUp!.CountUp(id, value, options).start()
      })
    }

    const initWeather = async () => {
      const badge = document.getElementById('weatherBadge')
      if (!badge) return

      const currentLang = document.documentElement.lang === 'id' ? 'id' : 'en'
      const cityLabel = 'Bandung'
      const fallbackDayLabel = currentLang === 'id' ? 'Hari ini' : 'Today'

      ;(badge as HTMLElement).style.display = 'inline-flex'

      try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.9175&longitude=107.6191&current=temperature_2m,weather_code&timezone=Asia%2FJakarta', { cache: 'no-store' })
        const data = await response.json()
        const temp = Math.round(data.current.temperature_2m)
        const code = Number(data.current.weather_code)
        const map = [
          { max: 0, icon: '☀️', descEn: 'Clear', descId: 'Cerah' },
          { max: 1, icon: '🌤️', descEn: 'Mostly Clear', descId: 'Sebagian Cerah' },
          { max: 2, icon: '⛅', descEn: 'Partly Cloudy', descId: 'Berawan Sebagian' },
          { max: 3, icon: '☁️', descEn: 'Overcast', descId: 'Mendung' },
          { max: 48, icon: '🌫️', descEn: 'Foggy', descId: 'Berkabut' },
          { max: 55, icon: '🌦️', descEn: 'Drizzle', descId: 'Gerimis' },
          { max: 65, icon: '🌧️', descEn: 'Rainy', descId: 'Hujan' },
          { max: 75, icon: '🌨️', descEn: 'Snowy', descId: 'Bersalju' },
          { max: 82, icon: '🌦️', descEn: 'Showers', descId: 'Hujan Ringan' },
          { max: 99, icon: '⛈️', descEn: 'Thunderstorm', descId: 'Badai Petir' },
        ]
        const match = map.find(entry => code <= entry.max) || map[map.length - 1]
        const iconEl = document.getElementById('wIcon')
        const tempEl = document.getElementById('wTemp')
        const cityEl = document.getElementById('wCity')
        const desc = currentLang === 'id' ? match.descId : match.descEn
        if (iconEl) iconEl.textContent = match.icon
        if (tempEl) tempEl.textContent = `${temp}°C`
        if (cityEl) cityEl.textContent = cityLabel
        badge.setAttribute('title', `${desc} · ${temp}°C · ${cityLabel}`)
      } catch {
        const iconEl = document.getElementById('wIcon')
        const tempEl = document.getElementById('wTemp')
        const cityEl = document.getElementById('wCity')
        if (iconEl) iconEl.textContent = '☕'
        if (tempEl) tempEl.textContent = cityLabel
        if (cityEl) cityEl.textContent = fallbackDayLabel
        badge.setAttribute('title', cityLabel)
      }
    }

    const initLightbox = () => {
      if (!window.GLightbox || !document.querySelector('.glightbox')) return
      galleryLightbox?.destroy?.()
      galleryLightbox = window.GLightbox({
        selector: '.glightbox',
        touchNavigation: true,
        loop: true,
        autoplayVideos: false,
        skin: 'clean',
        openEffect: 'fade',
        closeEffect: 'fade',
        closeButton: true,
        moreLength: 0,
      })
    }

    const initSwipers = () => {
      if (!window.Swiper) return

      const featured = document.querySelector('.featured-swiper') as HTMLElement | null
      if (featured && featured.dataset.swiperReady !== 'true') {
        featured.dataset.swiperReady = 'true'
        new window.Swiper!('.featured-swiper', {
          slidesPerView: 1,
          spaceBetween: 20,
          loop: true,
          autoplay: {
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          },
          pagination: {
            el: '.featured-swiper .swiper-pagination',
            clickable: true,
          },
          navigation: {
            nextEl: '.featured-swiper .swiper-button-next',
            prevEl: '.featured-swiper .swiper-button-prev',
          },
          breakpoints: {
            580: { slidesPerView: 2 },
            900: { slidesPerView: 3 },
          },
        })
      }
    }

    const bindModalBackdrop = () => {
      document.querySelectorAll<HTMLElement>('.modal-backdrop').forEach(modal => {
        modal.onclick = event => {
          if (event.target === modal) window.closeModal?.(modal.id)
        }
      })
    }

    initAos()
    const aosRetry = window.setTimeout(() => {
      if (!document.body.classList.contains('aos-ready')) initAos()
    }, 250)
    initCountUp()
    initWeather()
    initLightbox()
    initSwipers()
    bindModalBackdrop()

    const onLangChanged = () => {
      window.setTimeout(() => {
        initLightbox()
      }, 50)
    }

    const onGalleryRefresh = () => {
      window.setTimeout(() => {
        initLightbox()
      }, 50)
    }

    document.addEventListener('langChanged', onLangChanged)
    window.addEventListener('cotch:gallery-refresh', onGalleryRefresh)
    return () => {
      window.clearTimeout(aosRetry)
      document.removeEventListener('langChanged', onLangChanged)
      window.removeEventListener('cotch:gallery-refresh', onGalleryRefresh)
    }
  }, [pathname])

  return null
}
