import Link from 'next/link'
import type { SiteData } from '@/lib/site'
import LegacyIcon from '@/components/ui/LegacyIcon'
import { WordmarkLogo } from '@/components/ui/BrandLogo'

export default function Footer({ site }: { site: SiteData }) {
  const year = new Date().getFullYear()
  const socialLinks = [
    {
      href: site.socialInstagram,
      label: 'Instagram @cotchbandung',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      href: site.socialTiktok,
      label: 'TikTok @cotchbandung',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.78a4.85 4.85 0 01-1.07-.09z" />
        </svg>
      ),
    },
    {
      href: site.socialTwitter,
      label: 'X (Twitter) @cotchbandung',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.732-8.837L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      href: site.socialWhatsapp,
      label: 'WhatsApp',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
    },
  ]

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <WordmarkLogo className="footer__logo" />
            <p
              className="footer__tagline"
              data-copy-en="A place to slow down, sip something great, and feel at home. Come as you are — stay as long as you like."
              data-copy-id="Tempat untuk bersantai, menikmati minuman terbaik, dan merasa seperti di rumah."
            >
              A place to slow down, sip something great, and feel at home. Come as you are — stay as long as you like.
            </p>
            <div className="footer__social">
              {socialLinks.map(item => (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label}>
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="footer__heading" data-copy-en="Explore" data-copy-id="Jelajahi">Explore</p>
            <ul className="footer__links">
              {[
                { href: '/', en: 'Home', id: 'Beranda' },
                { href: '/menu', en: 'Menu', id: 'Menu' },
                { href: '/gallery', en: 'Gallery', id: 'Galeri' },
                { href: '/about', en: 'About Us', id: 'Tentang Kami' },
              ].map(({ href, en, id }) => (
                <li key={href}>
                  <Link href={href} className="footer-link" data-copy-en={en} data-copy-id={id}>{en}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="footer__heading" data-copy-en="Services" data-copy-id="Layanan">Services</p>
            <ul className="footer__links">
              {[
                { href: '/booking', en: 'Table Reservation', id: 'Reservasi Meja' },
                { href: '/waitlist', en: 'Join Waitlist', id: 'Daftar Waitlist' },
                { href: '/order', en: 'Order Online', id: 'Pesan Online' },
                { href: '/lookup', en: 'My Booking', id: 'Pesanan Saya' },
              ].map(({ href, en, id }) => (
                <li key={href}>
                  <Link href={href} className="footer-link" data-copy-en={en} data-copy-id={id}>{en}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="footer__heading" data-copy-en="Visit Us" data-copy-id="Kunjungi Kami">Visit Us</p>
            <ul className="footer__links">
              <li style={{ fontSize: '.82rem', lineHeight: 1.65 }} data-copy-en={site.locationEn} data-copy-id={site.locationId}>{site.locationId}</li>
              <li style={{ marginTop: 8 }}>
                <a href={site.mapsLink} target="_blank" rel="noopener" style={{ fontSize: '.78rem', color: 'var(--red)', fontWeight: 600, opacity: .85 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <LegacyIcon name="map-pin" size={14} />
                    <span data-copy-en="Google Maps ↗" data-copy-id="Google Maps ↗">Google Maps ↗</span>
                  </span>
                </a>
              </li>
              <li
                style={{ marginTop: 8, fontSize: '.82rem' }}
                data-copy-en={`${site.daysText}, ${site.openTime}–${site.closeTime} WIB`}
                data-copy-id={`${site.daysTextId}, ${site.openTime}–${site.closeTime} WIB`}
              >
                {site.daysText}, {site.openTime}–{site.closeTime} WIB
              </li>
              <li style={{ marginTop: 10 }}>
                <span
                  className={`status-pill ${site.isOpen ? 'open' : 'closed'}`}
                  data-copy-en={site.isOpen ? 'Open Now' : 'Closed'}
                  data-copy-id={site.isOpen ? 'Buka Sekarang' : 'Tutup'}
                >
                  {site.isOpen ? 'Open Now' : 'Closed'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
          <div className="container">
            <div className="footer__bottom">
              <span data-copy-en={`© ${year} Cotch. All rights reserved.`} data-copy-id={`© ${year} Cotch. Hak cipta dilindungi.`}>
                &copy; {year} Cotch. All rights reserved.
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="visitor-counter">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span data-copy-en="Visitors" data-copy-id="Pengunjung">Visitors</span>: <span>{site.visitorCount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
