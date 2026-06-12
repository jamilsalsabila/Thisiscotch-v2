import Link from 'next/link'
import LegacyIcon from '@/components/ui/LegacyIcon'
import { unstable_cache } from 'next/cache'
import { createAdminClient, hasAdminSupabaseEnv } from '@/lib/supabase/server'
import { getSiteData } from '@/lib/site'
import type { Database } from '@/types/database'

export const metadata = { title: 'About Us — Cotch' }
export const dynamic = 'force-dynamic'

const getAboutGallery = unstable_cache(
  async (): Promise<Database['public']['Tables']['gallery_items']['Row'][]> => {
    if (!hasAdminSupabaseEnv()) return []
    const supabase = createAdminClient()
    const { data } = await (supabase.from('gallery_items').select('*').eq('is_active', true).order('sort_order') as any)
    return (data as Database['public']['Tables']['gallery_items']['Row'][] | null) ?? []
  },
  ['about_gallery'],
  { revalidate: 120 }
)

const FALLBACK = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
  'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=80',
  'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80',
  'https://images.unsplash.com/photo-1507914997893-4dcfcb6d1af8?w=800&q=80',
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80',
]

export default async function AboutPage() {
  const [site, gallery] = await Promise.all([getSiteData(), getAboutGallery()])
  const aboutImgMain = gallery[0]?.src || FALLBACK[0]
  const aboutImgSub = gallery[4]?.src || gallery[1]?.src || FALLBACK[4]
  const semiOutdoorMain = gallery[2]?.src || FALLBACK[2]
  const semiOutdoorSub = gallery[5]?.src || FALLBACK[5]

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="section-label" data-copy-en="Our Story" data-copy-id="Cerita Kami">Our Story</div>
          <h1 data-copy-en="Our Story" data-copy-id="Cerita Kami">Our Story</h1>
          <p data-copy-en="Born from a love of great coffee and great people." data-copy-id="Lahir dari cinta terhadap kopi yang baik dan orang-orang yang baik.">Born from a love of great coffee and great people.</p>
        </div>
      </div>

      {/* ── Main About ── */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-imgs">
              <div className="about-img-main" style={{ overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={aboutImgMain} alt="Cotch interior" data-alt-en="Cotch interior" data-alt-id="Interior Cotch" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="about-img-float" style={{ overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={aboutImgSub} alt="Barista at work" data-alt-en="Barista at work" data-alt-id="Barista sedang bekerja" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            <div>
              <div className="section-label" data-copy-en="Who We Are" data-copy-id="Siapa Kami">Who We Are</div>
              <h2 className="section-title" data-copy-en="More Than Just Coffee" data-copy-id="Lebih dari Sekadar Kopi">More Than Just Coffee</h2>

              <p style={{ marginBottom: 20, lineHeight: 1.8 }} data-copy-en="Cotch was born from a simple belief: that a great cup of coffee, paired with the right space, can change your entire day. We&apos;re not just a cafe — we&apos;re a destination for those who want to slow down, connect, and rediscover the joy in everyday moments." data-copy-id="Cotch lahir dari keyakinan sederhana: secangkir kopi yang nikmat, dipadukan dengan ruang yang tepat, bisa mengubah seluruh harimu. Kami bukan sekadar cafe — kami adalah destinasi bagi mereka yang ingin melambat, terhubung, dan menemukan kembali kebahagiaan dalam momen sehari-hari." data-copy-mode="html">
                Cotch was born from a simple belief: that a great cup of coffee, paired with the right space, can change your entire day. We&apos;re not just a cafe — we&apos;re a destination for those who want to slow down, connect, and rediscover the joy in everyday moments.
              </p>
              <p style={{ marginBottom: 32, lineHeight: 1.8, color: 'var(--muted)' }} data-copy-en="Our spaces — from the warm indoor corners to the breezy semi-outdoor terrace — are designed for every kind of person: the student who needs to focus, the friends catching up, the couple on a date, or the solo soul who just wants a quiet moment with a perfect brew." data-copy-id="Ruang kami — dari sudut indoor yang hangat hingga teras semi-outdoor yang sejuk — dirancang untuk setiap jenis tamu: pelajar yang butuh fokus, teman-teman yang ingin bercengkerama, pasangan yang berkencan, atau jiwa yang ingin menikmati momen tenang dengan seduhan yang sempurna.">
                Our spaces — from the warm indoor corners to the breezy semi-outdoor terrace — are designed for every kind of person: the student who needs to focus, the friends catching up, the couple on a date, or the solo soul who just wants a quiet moment with a perfect brew.
              </p>

              {[
                { icon: 'sparkles' as const, titleEn: 'Quality Above All', titleId: 'Kualitas di Atas Segalanya', descEn: 'We source single-origin beans from passionate farmers and roast them to bring out their best character.', descId: 'Kami memilih biji single-origin dari petani penuh dedikasi dan memanggangnya untuk menonjolkan karakter terbaiknya.' },
                { icon: 'user' as const, titleEn: 'People First', titleId: 'Manusia Lebih Dulu', descEn: 'Every staff member is trained not just in coffee, but in creating an experience that feels genuinely warm and welcoming.', descId: 'Setiap staf dilatih bukan hanya soal kopi, tetapi juga dalam menciptakan pengalaman yang benar-benar hangat dan ramah.' },
                { icon: 'home' as const, titleEn: 'Thoughtful Design', titleId: 'Desain yang Penuh Pertimbangan', descEn: 'Our space is crafted to feel comfortable for hours — the kind of place you don’t want to leave.', descId: 'Ruang kami dirancang agar nyaman ditempati berjam-jam — tempat yang rasanya sulit untuk ditinggalkan.' },
              ].map(({ icon, titleEn, titleId, descEn, descId }) => (
                <div key={titleEn} className="value-card">
                  <div className="value-card__icon"><LegacyIcon name={icon} size={26} style={{ color: 'var(--red)' }} /></div>
                  <div>
                    <div className="value-card__title" data-copy-en={titleEn} data-copy-id={titleId}>{titleEn}</div>
                    <div className="value-card__desc" data-copy-en={descEn} data-copy-id={descId}>{descEn}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Indoor & Semi-Outdoor ── */}
      <section className="section" style={{ background: 'var(--cream-dark)' }}>
        <div className="container">
          <div className="about-grid about-grid--reversed">
            <div className="about-imgs">
              <div className="about-img-main" style={{ overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={semiOutdoorMain} alt="Semi-outdoor terrace" data-alt-en="Semi-outdoor terrace" data-alt-id="Teras semi-outdoor" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="about-img-float" style={{ overflow: 'hidden', left: 'auto', right: '-32px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={semiOutdoorSub} alt="Garden area" data-alt-en="Garden area" data-alt-id="Area taman" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            <div>
              <div className="section-label" data-copy-en="The Space" data-copy-id="Ruang Kami">The Space</div>
              <h2 className="section-title" data-copy-en="Indoor &amp; Semi-Outdoor" data-copy-id="Indoor &amp; Semi-Outdoor" data-copy-mode="html">Indoor &amp; Semi-Outdoor</h2>
              <p style={{ lineHeight: 1.8, marginBottom: 20 }} data-copy-en="We offer two distinct atmospheres to match your mood. The indoor area is cozy and intimate — warm lighting, curated music, and the comforting smell of freshly brewed coffee. The semi-outdoor terrace brings you closer to nature: an open sky, a soft breeze, and a garden that makes every sip feel like a retreat." data-copy-id="Kami menghadirkan dua suasana berbeda untuk menyesuaikan mood Anda. Area indoor terasa hangat dan intim — pencahayaan yang nyaman, musik yang terkurasi, dan aroma kopi segar yang menenangkan. Teras semi-outdoor membawa Anda lebih dekat ke alam: langit terbuka, semilir angin, dan taman yang membuat setiap tegukan terasa seperti pelarian singkat.">
                We offer two distinct atmospheres to match your mood. The indoor area is cozy and intimate — warm lighting, curated music, and the comforting smell of freshly brewed coffee. The semi-outdoor terrace brings you closer to nature: an open sky, a soft breeze, and a garden that makes every sip feel like a retreat.
              </p>
              <p style={{ lineHeight: 1.8, color: 'var(--muted)' }} data-copy-en="Whether you&apos;re here for work or play, we have a spot just for you. Book your table in advance and choose where you&apos;d like to sit." data-copy-id="Baik Anda datang untuk bekerja maupun bersantai, kami punya tempat yang pas untuk Anda. Pesan meja lebih dulu dan pilih area duduk yang Anda inginkan." data-copy-mode="html">
                Whether you&apos;re here for work or play, we have a spot just for you. Book your table in advance and choose where you&apos;d like to sit.
              </p>
              <div style={{ marginTop: 28 }}>
                <Link href="/booking" className="btn btn--primary"><span data-copy-en="Reserve Your Spot" data-copy-id="Reservasi Tempatmu">Reserve Your Spot</span></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Commitment ── */}
      <section className="section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 48 }}>
            <div className="section-label" data-copy-en="Our Commitment" data-copy-id="Komitmen Kami">Our Commitment</div>
            <h2 className="section-title" data-copy-en="What We Stand For" data-copy-id="Nilai yang Kami Pegang">What We Stand For</h2>
          </div>
          <div className="grid-3">
            {[
              { icon: 'fire' as const, titleEn: 'Ethical Sourcing', titleId: 'Sourcing yang Etis', descEn: 'We build direct relationships with farmers and support sustainable growing practices.', descId: 'Kami membangun hubungan langsung dengan petani dan mendukung praktik budidaya yang berkelanjutan.' },
              { icon: 'paint-brush' as const, titleEn: 'Art of Brewing', titleId: 'Seni Meracik', descEn: 'Every drink is crafted with precision — from grind size to extraction time to latte art.', descId: 'Setiap minuman diracik dengan presisi — dari ukuran giling, waktu ekstraksi, hingga latte art.' },
              { icon: 'home' as const, titleEn: 'A Third Place', titleId: 'Tempat Ketiga', descEn: 'Home, work, and then there’s Cotch — a space that’s uniquely yours to enjoy.', descId: 'Setelah rumah dan tempat kerja, ada Cotch — ruang yang terasa khusus untuk Anda nikmati.' },
            ].map(({ icon, titleEn, titleId, descEn, descId }) => (
              <div key={titleEn} className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--red)' }}>
                  <LegacyIcon name={icon} size={28} />
                </div>
                <h4 style={{ marginBottom: 10 }} data-copy-en={titleEn} data-copy-id={titleId}>{titleEn}</h4>
                <p style={{ fontSize: '.85rem', color: 'var(--muted)' }} data-copy-en={descEn} data-copy-id={descId}>{descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Location ── */}
      <section className="section">
        <div className="container">
          <div className="grid-map-lg">
            <div data-aos="fade-up">
              <div className="section-label" data-copy-en="Location" data-copy-id="Lokasi">Location</div>
              <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem,2.5vw,2rem)' }} data-copy-en="Find Us" data-copy-id="Temukan Kami">Find Us</h2>

              <div style={{ display: 'flex', gap: 14, marginBottom: 24, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(196,18,48,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--red)' }}>
                  <LegacyIcon name="map-pin" size={22} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>{site.locationId}</p>
                  <a href={site.mapsLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.8rem', color: 'var(--red)', fontWeight: 600 }}>
                    <span data-copy-en="Open in Google Maps ↗" data-copy-id="Buka di Google Maps ↗">Open in Google Maps ↗</span>
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, marginBottom: 32, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,148,26,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--gold)' }}>
                  <LegacyIcon name="clock" size={22} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, marginBottom: 2 }} data-copy-en={site.daysText} data-copy-id={site.daysTextId}>{site.daysText}</p>
                  <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>{site.openTime} – {site.closeTime} WIB</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, marginBottom: 32, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(37,211,102,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#25D366' }}>
                  <LegacyIcon name="chat-bubble" size={22} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, marginBottom: 2 }} data-copy-en="WhatsApp" data-copy-id="WhatsApp">WhatsApp</p>
                  <a href={site.socialWhatsapp} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.85rem', color: '#25D366', fontWeight: 600 }}>
                    <span data-copy-en="Chat with us →" data-copy-id="Chat dengan kami →">Chat with us →</span>
                  </a>
                </div>
              </div>

              <div style={{ background: 'var(--cream-dark)', borderRadius: 'var(--radius-sm)', padding: '16px 18px', fontSize: '.82rem', color: 'var(--muted)', borderLeft: '3px solid var(--gold)' }}>
                <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 4 }} data-copy-en="Getting Here" data-copy-id="Cara Menuju Sini">Getting Here</strong>
                <span data-copy-en="Easy to reach from Jalan Merdeka and Jalan Asia Afrika. Parking is available around the building." data-copy-id="Mudah dijangkau dari Jalan Merdeka dan Jalan Asia Afrika. Tersedia area parkir di sekitar gedung.">Mudah dijangkau dari Jalan Merdeka dan Jalan Asia Afrika. Tersedia area parkir di sekitar gedung.</span>
              </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="150">
              <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', position: 'relative' }}>
              <iframe
                src={site.mapsEmbedUrl}
                width="100%" height="420"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                title="Cotch Cafe Location — LLRE Martadinata 221, Bandung"
                data-title-en="Cotch Cafe Location — LLRE Martadinata 221, Bandung"
                data-title-id="Lokasi Cafe Cotch — LLRE Martadinata 221, Bandung"
              />
              <a href={site.mapsLink} target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', bottom: 14, right: 14, background: '#fff', color: 'var(--red)', fontSize: '.78rem', fontWeight: 700, padding: '8px 14px', borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,.15)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span data-copy-en="Open in Maps" data-copy-id="Buka di Peta">Open in Maps</span>
              </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section--sm" style={{ background: 'var(--red)' }}>
        <div className="container text-center" style={{ padding: '56px 24px' }}>
          <h2 style={{ color: '#fff', marginBottom: 12 }} data-copy-en="Come Visit Us" data-copy-id="Datang dan Kunjungi Kami">Come Visit Us</h2>
          <p style={{ color: 'rgba(255,255,255,.8)', maxWidth: 480, margin: '0 auto 28px', fontSize: '.95rem' }}>
            <span>{site.locationId}</span><br />
            <span data-copy-en={`${site.daysText}, ${site.openTime} – ${site.closeTime} WIB`} data-copy-id={`${site.daysTextId}, ${site.openTime} – ${site.closeTime} WIB`}>
              {site.daysText}, {site.openTime} – {site.closeTime} WIB
            </span>
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/booking" className="btn btn--lg" style={{ background: '#fff', color: 'var(--red)', borderColor: '#fff' }}>
              <span data-copy-en="Book a Table" data-copy-id="Pesan Meja">Book a Table</span>
            </Link>
            <a href={site.socialWhatsapp} className="btn btn--lg btn--outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.5)' }} target="_blank" rel="noopener noreferrer">
              <span data-copy-en="Chat with Us" data-copy-id="Chat dengan Kami">Chat with Us</span>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
