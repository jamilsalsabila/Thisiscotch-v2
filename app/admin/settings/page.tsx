import { requireAdminAccess } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { saveSiteSettings, saveSiteSettingsForm } from '@/app/admin/actions'
import { DEFAULT_SITE } from '@/lib/site'
import { getMailConfigurationStatus } from '@/lib/mailer'
import LegacyIcon from '@/components/ui/LegacyIcon'

export default async function AdminSettingsPage() {
  await requireAdminAccess()
  const supabase = createAdminClient()
  const { data } = await (supabase.from('site_settings').select('key, value') as any)
  const settings = new Map((((data as Array<{ key: string; value: string }> | null) ?? []).map(item => [item.key, item.value])))
  const heroMain = settings.get('hero_img_main') ?? DEFAULT_SITE.heroImgMain
  const heroFloat = settings.get('hero_img_float') ?? DEFAULT_SITE.heroImgFloat
  const mailStatus = getMailConfigurationStatus()

  return (
    <>
      <div className="a-card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LegacyIcon name="envelope" size={22} /> Order Email Notifications
        </h2>
        <div
          style={{
            marginTop: 14,
            borderRadius: 10,
            padding: '14px 16px',
            border: `1px solid ${mailStatus.enabled ? '#9fd3b0' : '#f5c17b'}`,
            background: mailStatus.enabled ? '#f3fbf6' : '#fff8ef',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: mailStatus.enabled ? '#166534' : '#92400e', marginBottom: 8 }}>
            <span>●</span>
            <span>{mailStatus.enabled ? 'SMTP Active' : 'SMTP Needs Attention'}</span>
          </div>
          <p style={{ fontSize: '.85rem', lineHeight: 1.7, color: mailStatus.enabled ? '#166534' : '#78350f', margin: 0 }}>
            {mailStatus.enabled
              ? 'Notifikasi order baru via email sudah aktif. Setiap order baru akan dikirim ke alamat admin yang dikonfigurasi.'
              : 'Notifikasi order baru belum aktif penuh. Isi MAIL_SMTP_HOST, MAIL_SMTP_USER, dan MAIL_SMTP_PASS dengan kredensial aktif di environment agar email order terkirim.'}
          </p>
          <div className="admin-settings-mail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 14 }}>
            <div style={{ fontSize: '.8rem', color: 'var(--a-muted)' }}>
              <strong style={{ display: 'block', color: 'var(--a-text)' }}>Admin Email</strong>
              {mailStatus.adminEmail}
            </div>
            <div style={{ fontSize: '.8rem', color: 'var(--a-muted)' }}>
              <strong style={{ display: 'block', color: 'var(--a-text)' }}>From</strong>
              {mailStatus.fromName} &lt;{mailStatus.fromEmail}&gt;
            </div>
            <div style={{ fontSize: '.8rem', color: 'var(--a-muted)' }}>
              <strong style={{ display: 'block', color: 'var(--a-text)' }}>Site URL</strong>
              {mailStatus.siteUrl}
            </div>
          </div>
          <div className="admin-settings-mail-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {([
              ['SMTP Host', mailStatus.hostReady],
              ['SMTP User', mailStatus.userReady],
              ['SMTP Pass', mailStatus.passReady],
            ] as const).map(([label, ready]) => (
              <span
                key={label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 10px',
                  borderRadius: 999,
                  fontSize: '.74rem',
                  fontWeight: 700,
                  background: ready ? '#dcfce7' : '#ffedd5',
                  color: ready ? '#166534' : '#9a3412',
                  border: `1px solid ${ready ? '#86efac' : '#fdba74'}`,
                }}
              >
                <span>{ready ? '✓' : '!'}</span>
                <span>{label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="a-card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><LegacyIcon name="photo" size={22} /> Hero Images (Homepage)</h2>
        <p style={{ fontSize: '.85rem', color: 'var(--a-muted)', marginBottom: 20 }}>
          Gambar yang tampil di bagian atas halaman utama. Upload file baru atau masukkan URL gambar.
        </p>
        <form action={saveSiteSettingsForm}>
          <div className="a-grid-2">
            <div className="a-form-group">
              <label>Foto Utama (besar)</label>
              <div style={{ marginBottom: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroMain} alt="Hero main" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--a-border)' }} />
              </div>
              <input type="file" name="photo_main" accept="image/*" className="a-input" style={{ padding: 6 }} />
              <p style={{ fontSize: '.72rem', color: 'var(--a-muted)', marginTop: 6 }}>atau masukkan URL:</p>
              <input className="a-input" name="hero_img_main" defaultValue={heroMain} placeholder="https://..." style={{ marginTop: 4 }} />
            </div>
            <div className="a-form-group">
              <label>Foto Melayang (kecil)</label>
              <div style={{ marginBottom: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroFloat} alt="Hero float" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--a-border)' }} />
              </div>
              <input type="file" name="photo_float" accept="image/*" className="a-input" style={{ padding: 6 }} />
              <p style={{ fontSize: '.72rem', color: 'var(--a-muted)', marginTop: 6 }}>atau masukkan URL:</p>
              <input className="a-input" name="hero_img_float" defaultValue={heroFloat} placeholder="https://..." style={{ marginTop: 4 }} />
            </div>
          </div>
          <button type="submit" className="a-btn a-btn--primary">Simpan Hero Images</button>
        </form>
      </div>

      <form action={async (fd: FormData) => {
        'use server'
        await saveSiteSettings({
          site_name: String(fd.get('site_name') ?? ''),
          whatsapp_number: String(fd.get('whatsapp_number') ?? ''),
          whatsapp_message: String(fd.get('whatsapp_message') ?? ''),
          location_id: String(fd.get('location_id') ?? ''),
          location_en: String(fd.get('location_en') ?? ''),
          maps_link: String(fd.get('maps_link') ?? ''),
          social_instagram: String(fd.get('social_instagram') ?? ''),
          social_tiktok: String(fd.get('social_tiktok') ?? ''),
          social_twitter: String(fd.get('social_twitter') ?? ''),
        })
      }}>
      <div className="a-card">
        <h2>Contact &amp; WhatsApp</h2>
        <div className="a-grid-2">
          <div className="a-form-group">
            <label>WhatsApp Number <span style={{ fontWeight: 400, color: 'var(--a-muted)' }}>(with country code, no +)</span></label>
            <input className="a-input" name="whatsapp_number" defaultValue={settings.get('whatsapp_number') ?? DEFAULT_SITE.whatsappNumber} placeholder="628161617181" />
          </div>
          <div className="a-form-group">
            <label>WhatsApp Default Message</label>
            <input className="a-input" name="whatsapp_message" defaultValue={settings.get('whatsapp_message') ?? DEFAULT_SITE.whatsappMessage} />
          </div>
        </div>
      </div>

      <div className="a-card">
        <h2>Location &amp; Maps</h2>
        <div className="a-form-group">
          <label>Address (Indonesian)</label>
          <input className="a-input" name="location_id" defaultValue={settings.get('location_id') ?? DEFAULT_SITE.locationId} />
        </div>
        <div className="a-form-group">
          <label>Address (English)</label>
          <input className="a-input" name="location_en" defaultValue={settings.get('location_en') ?? DEFAULT_SITE.locationEn} />
        </div>
        <div className="a-form-group">
          <label>Google Maps Link</label>
          <input className="a-input" name="maps_link" defaultValue={settings.get('maps_link') ?? DEFAULT_SITE.mapsLink} placeholder="https://maps.app.goo.gl/..." />
        </div>
      </div>

      <div className="a-card">
        <h2>Social Media</h2>
        <div className="a-grid-3">
          <div className="a-form-group">
            <label>Instagram URL</label>
            <input className="a-input" name="social_instagram" defaultValue={settings.get('social_instagram') ?? DEFAULT_SITE.socialInstagram} placeholder="https://instagram.com/yourhandle" />
          </div>
          <div className="a-form-group">
            <label>TikTok URL</label>
            <input className="a-input" name="social_tiktok" defaultValue={settings.get('social_tiktok') ?? DEFAULT_SITE.socialTiktok} placeholder="https://tiktok.com/@yourhandle" />
          </div>
          <div className="a-form-group">
            <label>X / Twitter URL</label>
            <input className="a-input" name="social_twitter" defaultValue={settings.get('social_twitter') ?? DEFAULT_SITE.socialTwitter} placeholder="https://x.com/yourhandle" />
          </div>
        </div>
      </div>

      <div className="a-card">
        <h2>Site Info</h2>
        <div className="a-form-group" style={{ maxWidth: 320 }}>
          <label>Site / Cafe Name</label>
          <input className="a-input" name="site_name" defaultValue={settings.get('site_name') ?? DEFAULT_SITE.siteName} />
        </div>
      </div>

      <button className="a-btn a-btn--primary" type="submit" style={{ fontSize: '1rem', padding: '12px 28px' }}>
        Save All Settings
      </button>
      </form>

      <div className="a-card" style={{ marginTop: 24, background: '#fef9f0', borderColor: '#fcd29e' }}>
        <h3 style={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
          <LegacyIcon name="exclamation-triangle" size={20} /> Note on Password Change
        </h3>
        <p style={{ fontSize: '.85rem', color: '#78350f', marginTop: 6, lineHeight: 1.7 }}>
          The admin password is stored via <code>ADMIN_PASSWORD</code>. Edit your environment configuration directly to change the password. If that variable is not set yet, login still falls back to the legacy password <strong>cotch@dmin25</strong> for PHP parity.
        </p>
      </div>
    </>
  )
}
