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
    }

    const savedTheme = localStorage.getItem('cotch_theme') || 'light'
    document.documentElement.setAttribute('data-theme', savedTheme)

    const savedLang = localStorage.getItem('cotch_lang') || 'en'
    document.documentElement.lang = savedLang
    applyLanguageToDom(savedLang === 'id' ? 'id' : 'en')

    const applyResolvedLanguage = (value?: string) => {
      const normalized = value === 'id' ? 'id' : 'en'
      localStorage.setItem('cotch_lang', normalized)
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

      try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.9175&longitude=107.6191&current=temperature_2m,weather_code&timezone=Asia%2FJakarta', { cache: 'no-store' })
        const data = await response.json()
        const temp = Math.round(data.current.temperature_2m)
        const code = Number(data.current.weather_code)
        const map = [
          { max: 0, icon: '☀️', desc: 'Clear' },
          { max: 1, icon: '🌤️', desc: 'Mostly Clear' },
          { max: 2, icon: '⛅', desc: 'Partly Cloudy' },
          { max: 3, icon: '☁️', desc: 'Overcast' },
          { max: 48, icon: '🌫️', desc: 'Foggy' },
          { max: 55, icon: '🌦️', desc: 'Drizzle' },
          { max: 65, icon: '🌧️', desc: 'Rainy' },
          { max: 75, icon: '🌨️', desc: 'Snowy' },
          { max: 82, icon: '🌦️', desc: 'Showers' },
          { max: 99, icon: '⛈️', desc: 'Thunderstorm' },
        ]
        const match = map.find(entry => code <= entry.max) || map[map.length - 1]
        const iconEl = document.getElementById('wIcon')
        const tempEl = document.getElementById('wTemp')
        const cityEl = document.getElementById('wCity')
        if (iconEl) iconEl.textContent = match.icon
        if (tempEl) tempEl.textContent = `${temp}°C`
        if (cityEl) cityEl.textContent = 'Bandung'
        badge.setAttribute('title', `${match.desc} · ${temp}°C · Bandung`)
        ;(badge as HTMLElement).style.display = 'inline-flex'
      } catch {
        ;(badge as HTMLElement).style.display = 'none'
      }
    }

    const initLightbox = () => {
      if (!window.GLightbox || !document.querySelector('.glightbox')) return
      window.GLightbox({
        selector: '.glightbox',
        touchNavigation: true,
        loop: true,
        autoplayVideos: false,
        skin: 'clean',
        openEffect: 'fade',
        closeEffect: 'fade',
      })
    }

    const initSwipers = () => {
      if (!window.Swiper) return

      document.querySelectorAll('.featured-swiper').forEach(node => {
        if ((node as HTMLElement).dataset.swiperReady === 'true') return
        ;(node as HTMLElement).dataset.swiperReady = 'true'
        new window.Swiper!(node, {
          slidesPerView: 1.1,
          spaceBetween: 18,
          loop: false,
          pagination: {
            el: node.querySelector('.swiper-pagination'),
            clickable: true,
          },
          navigation: {
            nextEl: node.querySelector('.swiper-button-next'),
            prevEl: node.querySelector('.swiper-button-prev'),
          },
          breakpoints: {
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          },
        })
      })
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

    document.addEventListener('langChanged', onLangChanged)
    return () => {
      window.clearTimeout(aosRetry)
      document.removeEventListener('langChanged', onLangChanged)
    }
  }, [pathname])

  return null
}
