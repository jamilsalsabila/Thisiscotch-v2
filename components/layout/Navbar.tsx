'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import LegacyIcon from '@/components/ui/LegacyIcon'
import { NavBrandLogo } from '@/components/ui/BrandLogo'

const links = [
  { href: '/',         en: 'Home',     id: 'Beranda' },
  { href: '/menu',     en: 'Menu',     id: 'Menu' },
  { href: '/gallery',  en: 'Gallery',  id: 'Galeri' },
  { href: '/booking',  en: 'Reserve',  id: 'Reservasi' },
  { href: '/waitlist', en: 'Waitlist', id: 'Waitlist' },
  { href: '/reviews',  en: 'Reviews',  id: 'Ulasan' },
  { href: '/about',    en: 'About',    id: 'Tentang' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [dark, setDark]             = useState(false)
  const [lang, setLang]             = useState<'EN' | 'ID'>('EN')

  useEffect(() => {
    const saved = localStorage.getItem('cotch_theme')
    if (saved === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); setDark(true) }
    const savedLang = localStorage.getItem('cotch_lang')
    if (savedLang) setLang(savedLang.toUpperCase() as 'EN' | 'ID')
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('cotch_theme', next ? 'dark' : 'light')
  }

  function toggleLang(l: 'EN' | 'ID') {
    setLang(l)
    const lower = l.toLowerCase() as 'en' | 'id'
    localStorage.setItem('cotch_lang', lower)
    // storage event doesn't fire for same-tab changes, use custom event
    window.dispatchEvent(new CustomEvent('cotch:lang', { detail: lower }))
  }

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`} id="mainNav">
      <div className="nav__inner">
        <Link href="/" className="nav__logo">
          <NavBrandLogo />
        </Link>

        <ul className={`nav__links${menuOpen ? ' open' : ''}`} id="navLinks">
          {links.map(({ href, en, id }) => (
            <li key={href}>
              <Link href={href} className={pathname === href ? 'active' : ''}>
                {lang === 'ID' ? id : en}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav__actions">
          <div className="nav__lang" aria-label="Language selector">
            <button className={lang === 'EN' ? 'active' : ''} data-lang="en" onClick={() => toggleLang('EN')}>EN</button>
            <button className={lang === 'ID' ? 'active' : ''} data-lang="id" onClick={() => toggleLang('ID')}>ID</button>
          </div>

          <button className="nav__theme" onClick={toggleDark} aria-label="Toggle dark mode">
            {dark ? <LegacyIcon name="sun" size={16} /> : <LegacyIcon name="moon" size={16} />}
          </button>

          <Link href="/order" className="nav__order-btn">
            {lang === 'ID' ? 'Pesan Sekarang' : 'Order Now'}
          </Link>

          <button
            className={`nav__hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            {menuOpen ? <LegacyIcon name="x-mark" size={20} /> : <Bars3Icon style={{ width: 20, height: 20 }} />}
          </button>
        </div>
      </div>
    </nav>
  )
}
