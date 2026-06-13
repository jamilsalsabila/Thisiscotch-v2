import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { createAdminClient, hasAdminSupabaseEnv } from '@/lib/supabase/server'
import { formatRupiah } from '@/utils/format'
import { DEFAULT_SITE, getSiteData } from '@/lib/site'
import LegacyIcon from '@/components/ui/LegacyIcon'
import type { Database } from '@/types/database'
import GallerySection from '@/components/home/GallerySection'
import FeaturedMenuHighlights from '@/components/home/FeaturedMenuHighlights'
import { getPublicLang } from '@/lib/server-lang'
import {
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

export const dynamic = 'force-dynamic'

const getHomeData = unstable_cache(
  async (): Promise<{
    menuItems: Database['public']['Tables']['menu_items']['Row'][]
    gallery: Database['public']['Tables']['gallery_items']['Row'][]
    reviews: Database['public']['Tables']['reviews']['Row'][]
    totalMenuItems: number
    totalTables: number
  }> => {
    if (!hasAdminSupabaseEnv()) {
      return {
        menuItems: [],
        gallery: [],
        reviews: [],
        totalMenuItems: 0,
        totalTables: 0,
      }
    }

    const supabase = createAdminClient()
    const [
      { data: menuItems, count: totalMenuItems },
      { data: gallery },
      { data: reviews },
      { count: totalTables },
    ] = await Promise.all([
      (supabase.from('menu_items').select('*', { count: 'exact' }).eq('is_featured', true).eq('is_available', true).order('sort_order') as any),
      (supabase.from('gallery_items').select('*').eq('is_active', true).order('sort_order').limit(8) as any),
      (supabase.from('reviews').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(3) as any),
      (supabase.from('floor_tables').select('*', { count: 'exact', head: true }).eq('is_active', true) as any),
    ])
    return {
      menuItems: (menuItems as Database['public']['Tables']['menu_items']['Row'][] | null) ?? [],
      gallery: (gallery as Database['public']['Tables']['gallery_items']['Row'][] | null) ?? [],
      reviews: (reviews as Database['public']['Tables']['reviews']['Row'][] | null) ?? [],
      totalMenuItems: totalMenuItems ?? 0,
      totalTables: totalTables ?? 0,
    }
  },
  ['home_data'],
  { revalidate: 120 }
)

export default async function HomePage() {
  const [{ menuItems, gallery, reviews, totalMenuItems, totalTables }, site, lang] = await Promise.all([
    getHomeData(),
    getSiteData(),
    getPublicLang(),
  ])

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__dots" />
        <div className="hero__inner">
          <div className="hero__text">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
              <span
                className={`status-pill ${site.isOpen ? 'open' : 'closed'}`}
                data-copy-en={site.isOpen ? 'Open Now' : 'Closed'}
                data-copy-id={site.isOpen ? 'Buka Sekarang' : 'Tutup'}
              >
                {lang === 'id' ? (site.isOpen ? 'Buka Sekarang' : 'Tutup') : (site.isOpen ? 'Open Now' : 'Closed')}
              </span>
              <div className="hero__weather" id="weatherBadge" title="Current weather in Bandung" data-title-en="Current weather in Bandung" data-title-id="Cuaca saat ini di Bandung">
                <span id="wIcon">🌡️</span>
                <span id="wTemp">—°C</span>
                <span id="wCity">Bandung</span>
              </div>
            </div>

            <h1
              className="hero__title"
              data-aos="fade-up"
              data-copy-en="Where Every Sip<br>Tells a <em>Story</em>"
              data-copy-id="Di Setiap Tegukan<br>Ada <em>Cerita</em>"
              data-copy-mode="html"
            >
              {lang === 'id'
                ? <><span>Di Setiap Tegukan</span><br /><span>Ada <em>Cerita</em></span></>
                : <><span>Where Every Sip</span><br /><span>Tells a <em>Story</em></span></>}
            </h1>
            <p
              className="hero__subtitle"
              data-aos="fade-up"
              data-aos-delay="100"
              data-copy-en="Premium coffee, warm ambiance, and a space designed for those who appreciate the finer things in life."
              data-copy-id="Kopi premium, suasana hangat, dan ruang yang dirancang untuk mereka yang menghargai hal-hal terbaik dalam hidup."
            >
              {lang === 'id'
                ? 'Kopi premium, suasana hangat, dan ruang yang dirancang untuk mereka yang menghargai hal-hal terbaik dalam hidup.'
                : 'Premium coffee, warm ambiance, and a space designed for those who appreciate the finer things in life.'}
            </p>

            <div className="hero__cta" data-aos="fade-up" data-aos-delay="200">
              <Link href="/booking" className="btn btn--primary btn--lg">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect x="3" y="5" width="18" height="17" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                  <span data-copy-en="Reserve a Table" data-copy-id="Reservasi Meja">{lang === 'id' ? 'Reservasi Meja' : 'Reserve a Table'}</span>
                </span>
              </Link>
              <Link href="/menu" className="btn btn--outline btn--lg">
                <span data-copy-en="See Our Menu" data-copy-id="Lihat Menu Kami">{lang === 'id' ? 'Lihat Menu Kami' : 'See Our Menu'}</span>
              </Link>
            </div>

            <div className="hero__stats" data-aos="fade-up" data-aos-delay="300">
              <div>
                <div className="hero__stat-num"><span id="statTables" data-value={totalTables}>{totalTables}</span>+</div>
                <div className="hero__stat-label" data-copy-en="Tables" data-copy-id="Meja">{lang === 'id' ? 'Meja' : 'Tables'}</div>
              </div>
              <div style={{ width: 1, background: 'var(--border)' }} />
              <div>
                <div className="hero__stat-num"><span id="statMenu" data-value={totalMenuItems}>{totalMenuItems}</span>+</div>
                <div className="hero__stat-label" data-copy-en="Menu Items" data-copy-id="Item Menu">{lang === 'id' ? 'Item Menu' : 'Menu Items'}</div>
              </div>
              <div style={{ width: 1, background: 'var(--border)' }} />
              <div>
                <div className="hero__stat-num"><span id="statDays" data-value={7}>7</span></div>
                <div className="hero__stat-label" data-copy-en="Days / Week" data-copy-id="Hari / Minggu">{lang === 'id' ? 'Hari / Minggu' : 'Days / Week'}</div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="hero__visual" data-aos="fade-up" data-aos-delay="150">
            <div className="hero__img-main" style={{ overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={site.heroImgMain || DEFAULT_SITE.heroImgMain} alt="Cotch Cafe Interior" data-alt-en="Cotch Cafe Interior" data-alt-id="Interior Cafe Cotch" loading="eager" fetchPriority="high" decoding="sync" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="hero__img-float" style={{ overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={site.heroImgFloat || DEFAULT_SITE.heroImgFloat} alt="Cotch signature drink" data-alt-en="Cotch signature drink" data-alt-id="Minuman signature Cotch" loading="eager" fetchPriority="high" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="hero__badge">
              <svg viewBox="0 0 108 108" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <path id="circlePath" d="M54,54 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1-76,0" />
                </defs>
                <circle cx="54" cy="54" r="52" fill="#D4941A" />
                <text fontSize="9" fontFamily="DM Sans, Inter, sans-serif" fontWeight="700" fill="white" letterSpacing="3.8">
                  <textPath href="#circlePath">PREMIUM · COTCH · COFFEE ·</textPath>
                </text>
                <text x="54" y="62" textAnchor="middle" fontSize="26" fill="white">☕</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pillars ──────────────────────────────────────────── */}
      <section className="section section--sm" style={{ background: 'var(--cream-dark)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="grid-pillars">
            {[
              { icon: 'sparkles' as const, color: 'var(--red)', bg: 'rgba(196,18,48,.08)', titleEn: 'Specialty Coffee', titleId: 'Kopi Spesial', descEn: 'Single-origin beans roasted to perfection, brewed by our passionate baristas.', descId: 'Biji single-origin yang dipanggang sempurna dan diseduh oleh barista kami yang penuh semangat.' },
              { icon: 'photo' as const, color: 'var(--gold)', bg: 'rgba(212,148,26,.08)', titleEn: 'Warm Ambiance', titleId: 'Suasana Hangat', descEn: 'Indoor and semi-outdoor spaces designed for comfort, conversation, and creativity.', descId: 'Ruang indoor dan semi-outdoor yang dirancang untuk kenyamanan, percakapan, dan kreativitas.' },
              { icon: 'calendar' as const, color: 'var(--red)', bg: 'rgba(196,18,48,.08)', titleEn: 'Easy Reservations', titleId: 'Reservasi Mudah', descEn: 'Book your table in minutes, get a digital ticket, and arrive with confidence.', descId: 'Pesan meja dalam hitungan menit, dapatkan tiket digital, dan datang dengan tenang.' },
            ].map(({ icon, color, bg, titleEn, titleId, descEn, descId }, index) => (
              <div key={titleEn} style={{ textAlign: 'center' }} data-aos="fade-up" data-aos-delay={index * 100}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color }}>
                  <LegacyIcon name={icon} size={28} />
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 6 }} data-copy-en={titleEn} data-copy-id={titleId}>{lang === 'id' ? titleId : titleEn}</h3>
                <p style={{ fontSize: '.85rem', color: 'var(--muted)' }} data-copy-en={descEn} data-copy-id={descId}>{lang === 'id' ? descId : descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Menu ─────────────────────────────────────── */}
      <section className="section">
        <div className="container">
            <div className="text-center" style={{ marginBottom: 48 }} data-aos="fade-up">
              <div className="section-label" data-copy-en="Menu Highlights" data-copy-id="Sorotan Menu">{lang === 'id' ? 'Sorotan Menu' : 'Menu Highlights'}</div>
              <h2 className="section-title" data-copy-en="Our Menu" data-copy-id="Menu Kami">{lang === 'id' ? 'Menu Kami' : 'Our Menu'}</h2>
              <p className="section-desc" style={{ margin: '0 auto' }} data-copy-en="Carefully crafted drinks to match any mood." data-copy-id="Minuman yang diracik dengan hati untuk setiap suasana.">{lang === 'id' ? 'Minuman yang diracik dengan hati untuk setiap suasana.' : 'Carefully crafted drinks to match any mood.'}</p>
            </div>

          {menuItems && menuItems.length > 0 ? (
            <FeaturedMenuHighlights items={menuItems} />
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
              <p><span data-copy-en="Menu will be available soon." data-copy-id="Menu akan segera tersedia.">{lang === 'id' ? 'Menu akan segera tersedia.' : 'Menu will be available soon.'}</span> <Link href="/order" style={{ color: 'var(--red)' }}>{lang === 'id' ? 'Cek menu lengkap →' : 'Check full menu →'}</Link></p>
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/menu" className="btn btn--outline"><span data-copy-en="View Full Menu →" data-copy-id="Lihat Semua Menu →">{lang === 'id' ? 'Lihat Semua Menu →' : 'View Full Menu →'}</span></Link>
          </div>
        </div>
      </section>

      {/* ── Gallery ──────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--cream-dark)' }}>
        <div className="container">
          <div className="section-hdr-split">
            <div data-aos="fade-up">
              <div className="section-label" data-copy-en="Gallery" data-copy-id="Galeri">{lang === 'id' ? 'Galeri' : 'Gallery'}</div>
              <h2 className="section-title" data-copy-en="Inside Cotch" data-copy-id="Di Dalam Cotch">{lang === 'id' ? 'Di Dalam Cotch' : 'Inside Cotch'}</h2>
            </div>
            <Link href="/gallery" className="btn btn--ghost btn--sm" data-aos="fade-up"><span data-copy-en="View All Photos →" data-copy-id="Lihat Semua Foto →">{lang === 'id' ? 'Lihat Semua Foto →' : 'View All Photos →'}</span></Link>
          </div>
          <GallerySection items={gallery ?? []} />
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────── */}
      {reviews && reviews.length > 0 && (
        <section className="section" style={{ background: 'var(--cream-dark)' }}>
          <div className="container">
            <div className="text-center" style={{ marginBottom: 40 }}>
              <div className="section-label" data-copy-en="Testimonials" data-copy-id="Testimoni">{lang === 'id' ? 'Testimoni' : 'Testimonials'}</div>
              <h2 className="section-title" data-copy-en="Loved by Our Guests" data-copy-id="Disukai Tamu Kami">{lang === 'id' ? 'Disukai Tamu Kami' : 'Loved by Our Guests'}</h2>
              <p className="section-desc" style={{ margin: '8px auto 0' }} data-copy-en="Real reviews from real visits." data-copy-id="Ulasan asli dari kunjungan nyata.">{lang === 'id' ? 'Ulasan asli dari kunjungan nyata.' : 'Real reviews from real visits.'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 360px))', justifyContent: 'center', gap: 28 }}>
              {reviews.map(review => (
                <div key={review.id} className="card">
                  <div className="card__body" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                      {Array.from({ length: Math.round(Number(review.overall_rating) || 5) }).map((_, i) => (
                        <span key={i} style={{ color: 'var(--gold)' }}>★</span>
                      ))}
                    </div>
                    <p style={{ color: 'var(--text)', fontSize: '.9rem', lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>
                      &ldquo;{review.comment}&rdquo;
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--red)', fontSize: '.9rem', flexShrink: 0 }}>
                        {review.reviewer_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{review.reviewer_name}</div>
                        {review.is_verified && <div style={{ fontSize: '.72rem', color: '#16a34a' }} data-copy-en="✓ Verified guest" data-copy-id="✓ Tamu terverifikasi">{lang === 'id' ? '✓ Tamu terverifikasi' : '✓ Verified guest'}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link href="/reviews" className="btn btn--outline"><span data-copy-en="See All Reviews →" data-copy-id="Lihat Semua Ulasan →">{lang === 'id' ? 'Lihat Semua Ulasan →' : 'See All Reviews →'}</span></Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Location ─────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="grid-map">
            <div className="location-content">
              <div className="section-label" data-copy-en="Location" data-copy-id="Lokasi">{lang === 'id' ? 'Lokasi' : 'Location'}</div>
              <h2 className="section-title" style={{ fontSize: 'clamp(1.6rem,2.5vw,2.2rem)' }} data-copy-en="Find Us in<br>Bandung" data-copy-id="Temukan Kami di<br>Bandung" data-copy-mode="html">{lang === 'id' ? <><span>Temukan Kami di</span><br /><span>Bandung</span></> : <><span>Find Us in</span><br /><span>Bandung</span></>}</h2>
              <div className="location-info">
                <div className="location-info__row">
                  <span className="location-info__icon">
                    <MapPinIcon style={{ width: 22, height: 22, color: 'var(--gold)' }} />
                  </span>
                  <div>
                    <p className="location-info__name" data-copy-en="Jl. L.L.R.E. Martadinata No. 221" data-copy-id="Jl. L.L.R.E. Martadinata No. 221">Jl. L.L.R.E. Martadinata No. 221</p>
                    <p className="location-info__sub" data-copy-en="Cihapit, Bandung Wetan, Kota Bandung 40114" data-copy-id="Cihapit, Bandung Wetan, Kota Bandung 40114">Cihapit, Bandung Wetan, Kota Bandung 40114</p>
                  </div>
                </div>
                <div className="location-info__row">
                  <span className="location-info__icon">
                    <ClockIcon style={{ width: 22, height: 22, color: 'var(--gold)' }} />
                  </span>
                  <div>
                    <p className="location-info__hours" data-copy-en={`${site.daysText} · ${site.openTime}–${site.closeTime} WIB`} data-copy-id={`${site.daysTextId} · ${site.openTime}–${site.closeTime} WIB`}>{lang === 'id' ? site.daysTextId : site.daysText} · {site.openTime}–{site.closeTime} WIB</p>
                  </div>
                </div>
              </div>
              <div className="location-btns">
                <a href="https://www.google.com/maps/search/?api=1&query=Cotch+Bandung" target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">
                  <span data-copy-en="Open in Google Maps" data-copy-id="Buka di Google Maps">{lang === 'id' ? 'Buka di Google Maps' : 'Open in Google Maps'}</span>
                </a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=Cotch+Bandung" target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm"><span data-copy-en="Get Directions ↗" data-copy-id="Petunjuk Arah ↗">{lang === 'id' ? 'Petunjuk Arah ↗' : 'Get Directions ↗'}</span></a>
              </div>
            </div>

            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', position: 'relative' }}>
              <iframe
                src="https://maps.google.com/maps?q=Jl.+LLRE+Martadinata+No.221,+Cihapit,+Bandung+Wetan,+Bandung&z=16&output=embed"
                width="100%" height="320"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                title="Cotch Cafe — Jl. LLRE Martadinata 221 Bandung"
              />
              <a
                href={site.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ position: 'absolute', bottom: 12, right: 12, background: '#fff', color: 'var(--red)', fontSize: '.75rem', fontWeight: 700, padding: '7px 13px', borderRadius: 18, boxShadow: '0 2px 8px rgba(0,0,0,.15)', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <span data-copy-en="Open Maps" data-copy-id="Buka Peta">{lang === 'id' ? 'Buka Peta' : 'Open Maps'}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ background: 'var(--red)', borderRadius: 24, padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }} data-aos="fade-up">
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,.05)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -30, width: 160, height: 160, background: 'rgba(255,255,255,.05)', borderRadius: '50%' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: 'rgba(255,255,255,.7)' }}>
                <LegacyIcon name="sparkles" size={36} />
              </span>
              <h2 style={{ color: '#fff', marginBottom: 14, fontSize: 'clamp(1.6rem,3vw,2.4rem)' }} data-copy-en="Ready for a Great Time?" data-copy-id="Siap untuk Waktu yang Menyenangkan?">{lang === 'id' ? 'Siap untuk Waktu yang Menyenangkan?' : 'Ready for a Great Time?'}</h2>
              <p style={{ color: 'rgba(255,255,255,.8)', maxWidth: 440, margin: '0 auto 32px', fontSize: '.95rem' }} data-copy-en="Reserve your table now or join the waitlist — we'll make sure your visit is unforgettable." data-copy-id="Reservasi mejamu sekarang atau masuk daftar tunggu — kami akan memastikan kunjunganmu tak terlupakan.">
                {lang === 'id'
                  ? 'Reservasi mejamu sekarang atau masuk daftar tunggu — kami akan memastikan kunjunganmu tak terlupakan.'
                  : 'Reserve your table now or join the waitlist — we’ll make sure your visit is unforgettable.'}
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/booking" className="btn btn--lg" style={{ background: '#fff', color: 'var(--red)', borderColor: '#fff' }}><span data-copy-en="Reserve a Table" data-copy-id="Reservasi Meja">{lang === 'id' ? 'Reservasi Meja' : 'Reserve a Table'}</span></Link>
                <Link href="/waitlist" className="btn btn--lg btn--outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}><span data-copy-en="Join Waitlist" data-copy-id="Masuk Daftar Tunggu">{lang === 'id' ? 'Masuk Daftar Tunggu' : 'Join Waitlist'}</span></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  )
}
