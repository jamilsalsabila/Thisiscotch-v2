'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { joinWaitlist, cancelWaitlist } from '@/app/(public)/waitlist/actions'
import { formatDateDisplay } from '@/utils/format'
import LegacyIcon from '@/components/ui/LegacyIcon'
import { WordmarkLogo } from '@/components/ui/BrandLogo'

const TIME_SLOTS = Array.from({ length: 19 }, (_, i) => {
  const h = Math.floor(i / 2) + 12
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

const TODAY = new Date().toISOString().split('T')[0]

type Result = { waitlistCode: string; position: number; date: string; time: string; name: string; partySize: number }

const HOW_IT_WORKS = [
  { icon: 'calendar' as const, titleEn: 'Fill in the form', titleId: 'Isi formulir', descEn: 'Choose your preferred date and time.', descId: 'Pilih tanggal dan waktu yang kamu inginkan.' },
  { icon: 'clipboard-list' as const, titleEn: 'Get your waitlist code', titleId: 'Dapatkan kode waitlist', descEn: 'Save your waitlist code for reference.', descId: 'Simpan kode waitlist kamu untuk referensi.' },
  { icon: 'chat-bubble' as const, titleEn: "We'll notify you", titleId: 'Kami akan menghubungi', descEn: "We'll contact you via WhatsApp once a table becomes available.", descId: 'Kami akan menghubungi kamu via WhatsApp begitu ada meja tersedia.' },
  { icon: 'sparkles' as const, titleEn: 'Come enjoy', titleId: 'Datang dan nikmati', descEn: 'Come by and enjoy the best Cotch experience.', descId: 'Datang dan nikmati pengalaman terbaik di Cotch!' },
]

export default function WaitlistForm() {
  const [lang, setLang] = useState<'en' | 'id'>('en')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]         = useState<Result | null>(null)
  const [error, setError]           = useState('')
  const [cancelCode, setCancelCode] = useState('')
  const [cancelMsg, setCancelMsg]   = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    partySize: '2', preferredDate: TODAY,
    preferredTime: '12:00', specialRequest: '',
  })

  useEffect(() => {
    const applyLang = (value?: string) => setLang(value === 'id' ? 'id' : 'en')

    applyLang(localStorage.getItem('cotch_lang') || 'en')

    const onLangChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ lang?: string } | string>).detail
      if (typeof detail === 'string') {
        applyLang(detail)
        return
      }
      applyLang(detail?.lang || localStorage.getItem('cotch_lang') || 'en')
    }

    document.addEventListener('langChanged', onLangChanged)
    return () => document.removeEventListener('langChanged', onLangChanged)
  }, [])

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const res = await joinWaitlist({
      guestName: form.name,
      guestPhone: form.phone,
      guestEmail: form.email,
      partySize: Number(form.partySize),
      preferredDate: form.preferredDate,
      preferredTime: form.preferredTime,
      specialRequest: form.specialRequest,
    })

    setSubmitting(false)
    if (!res.success) {
      setError(res.error ?? (lang === 'id' ? 'Terjadi kesalahan.' : 'Something went wrong.'))
      return
    }

    setResult({
      waitlistCode: res.waitlistCode!,
      position: res.position!,
      date: form.preferredDate,
      time: form.preferredTime,
      name: form.name,
      partySize: Number(form.partySize),
    })
    setForm({ name: '', phone: '', email: '', partySize: '2', preferredDate: TODAY, preferredTime: '12:00', specialRequest: '' })
  }

  async function handleCancel(e: React.FormEvent) {
    e.preventDefault()
    if (!cancelCode.trim()) return
    setCancelling(true)
    setCancelMsg('')
    const res = await cancelWaitlist(cancelCode)
    setCancelling(false)
    setCancelMsg(
      res.success
        ? (lang === 'id' ? 'Berhasil keluar dari waitlist.' : 'Removed from waitlist.')
        : (res.error ?? (lang === 'id' ? 'Tidak dapat membatalkan waitlist.' : 'Could not cancel waitlist.'))
    )
  }

  if (result) {
    return (
      <div className="modal-backdrop" style={{ display: 'flex' }}>
        <div className="modal" style={{ padding: 0, maxWidth: 440, background: 'transparent' }}>
          <div className="ticket">
            <div className="ticket__header" style={{ background: 'var(--gold)' }}>
              <WordmarkLogo />
              <div className="ticket__type" data-copy-en="Waitlist Confirmation" data-copy-id="Konfirmasi Daftar Tunggu">Waitlist Confirmation</div>
              <div className="ticket__code">{result.waitlistCode}</div>
            </div>
            <div className="ticket__body">
              {[
                { k: lang === 'id' ? 'Nama' : 'Name', v: result.name },
                { k: lang === 'id' ? 'Jumlah Tamu' : 'Party Size', v: `${result.partySize} pax` },
                { k: lang === 'id' ? 'Tanggal Pilihan' : 'Preferred Date', v: formatDateDisplay(result.date) },
                { k: lang === 'id' ? 'Waktu Pilihan' : 'Preferred Time', v: result.time },
                { k: lang === 'id' ? 'Posisi' : 'Position', v: lang === 'id' ? `#${result.position} dalam antrean` : `#${result.position} in queue` },
              ].map(({ k, v }) => (
                <div key={k} className="ticket__row">
                  <span className="ticket__key">{k}</span>
                  <span className="ticket__val">{v}</span>
                </div>
              ))}
              <div className="ticket__row">
                <span className="ticket__key" data-copy-en="Status" data-copy-id="Status">Status</span>
                <span className="ticket__val">
                  <span className="ticket__status active" data-copy-en="● Waiting" data-copy-id="● Menunggu">● Waiting</span>
                </span>
              </div>
            </div>
            <div className="ticket__footer">
              <p data-copy-en="Save your code. We'll contact you via WhatsApp when a table is available." data-copy-id="Simpan kode Anda. Kami akan menghubungi Anda via WhatsApp saat meja tersedia.">Save your code. We&apos;ll contact you via WhatsApp when a table is available.</p>
              <button className="btn btn--ghost btn--sm" style={{ marginTop: 14 }} onClick={() => setResult(null)}>
                <span data-copy-en="Close" data-copy-id="Tutup">Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid-halves" style={{ alignItems: 'start' }}>
      {/* Left: form */}
      <div>
        <form className="waitlist-form" onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: 20 }} data-copy-en="Your Details" data-copy-id="Detail Anda">Your Details</h3>

          <div className="form-group">
            <label className="form-label" data-copy-en="Full Name" data-copy-id="Nama Lengkap">Full Name</label>
            <input className="form-input" required value={form.name} onChange={set('name')} placeholder="Your name" data-placeholder-en="Your name" data-placeholder-id="Nama Anda" />
          </div>

          <div className="form-group">
            <label className="form-label" data-copy-en="WhatsApp Number" data-copy-id="Nomor WhatsApp">WhatsApp Number</label>
            <input className="form-input" required type="tel" value={form.phone} onChange={set('phone')} placeholder="+62..." />
          </div>

          <div className="form-group">
            <label className="form-label" data-copy-en="Email (optional)" data-copy-id="Email (opsional)">Email (optional)</label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" data-placeholder-en="your@email.com" data-placeholder-id="email@anda.com" />
          </div>

          <div className="form-group">
            <label className="form-label" data-copy-en="Party Size" data-copy-id="Jumlah Tamu">Party Size</label>
            <input className="form-input" type="number" required min={1} max={20} value={form.partySize} onChange={set('partySize')} />
          </div>

          <div className="date-row">
            <div className="form-group">
              <label className="form-label" data-copy-en="Preferred Date" data-copy-id="Tanggal Pilihan">Preferred Date</label>
              <input className="form-input" type="date" required min={TODAY} value={form.preferredDate} onChange={set('preferredDate')} />
            </div>
            <div className="form-group">
              <label className="form-label" data-copy-en="Preferred Time" data-copy-id="Waktu Pilihan">Preferred Time</label>
              <select className="form-select" value={form.preferredTime} onChange={set('preferredTime')}>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t} WIB</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" data-copy-en="Special Request" data-copy-id="Permintaan Khusus">Special Request</label>
            <textarea className="form-textarea" value={form.specialRequest} onChange={set('specialRequest')} placeholder="Any preferences or requirements..." data-placeholder-en="Any preferences or requirements..." data-placeholder-id="Ada preferensi atau kebutuhan khusus..." />
          </div>

          {error && (
            <div style={{ background: 'rgba(220,38,38,.08)', border: '1.5px solid #dc2626', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 20, color: '#dc2626', fontSize: '.875rem' }}>
              {error}
            </div>
          )}

          <button type="submit" className={`btn btn--primary w-full${submitting ? ' btn--loading' : ''}`} disabled={submitting}>
            {submitting ? '' : <span data-copy-en="Join Waitlist" data-copy-id="Masuk Daftar Tunggu">Join Waitlist</span>}
          </button>
        </form>
      </div>

      {/* Right: info panel */}
      <div>
        {/* How It Works */}
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ marginBottom: 16 }} data-copy-en="How It Works" data-copy-id="Cara Kerjanya">How It Works</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {HOW_IT_WORKS.map(({ icon, titleEn, titleId, descEn, descId }, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--cream-dark)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--red)' }}>
                  <LegacyIcon name={icon} size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{lang === 'id' ? titleId : titleEn}</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{lang === 'id' ? descId : descEn}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div style={{ padding: 20, background: 'rgba(196,18,48,.06)', border: '1.5px solid rgba(196,18,48,.2)', borderRadius: 'var(--radius-sm)', marginBottom: 24 }}>
          <strong style={{ color: 'var(--red)', fontSize: '.9rem' }} data-copy-en="💡 Tip" data-copy-id="💡 Tip">💡 Tip</strong>
          <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: 6, lineHeight: 1.6 }}>
            <span data-copy-en="If you already have a booking code, check your status at the " data-copy-id="Jika Anda sudah punya kode booking, cek status Anda di halaman ">If you already have a booking code, check your status at the </span><Link href="/lookup" style={{ color: 'var(--red)', fontWeight: 600 }} data-copy-en="My Booking" data-copy-id="Booking Saya">My Booking</Link><span data-copy-en=" page." data-copy-id="."> page.</span>
          </p>
        </div>

        {/* Cancel Waitlist */}
        <div style={{ padding: 20, background: 'var(--cream-dark)', borderRadius: 'var(--radius-sm)' }}>
          <h4 style={{ fontSize: '.95rem', marginBottom: 12 }} data-copy-en="Cancel Waitlist" data-copy-id="Batalkan Daftar Tunggu">Cancel Waitlist</h4>
          <form onSubmit={handleCancel}>
            <div className="waitlist-cancel-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                className="form-input"
                placeholder="Your WL-... code"
                data-placeholder-en="Your WL-... code"
                data-placeholder-id="Kode WL-... Anda"
                value={cancelCode}
                onChange={e => { setCancelCode(e.target.value); setCancelMsg('') }}
                style={{ fontFamily: 'monospace', textTransform: 'uppercase', flex: 1, minWidth: 160 }}
              />
              <button
                type="submit"
                className={`btn btn--sm${cancelling ? ' btn--loading' : ''}`}
                style={{ background: '#dc2626', color: '#fff', border: 'none' }}
                disabled={cancelling}
              >
                {cancelling ? '' : <span data-copy-en="Cancel" data-copy-id="Batalkan">Cancel</span>}
              </button>
            </div>
          </form>
          {cancelMsg && (
            <p style={{ marginTop: 10, fontSize: '.82rem', color: cancelMsg === 'Removed from waitlist.' || cancelMsg === 'Berhasil keluar dari waitlist.' ? 'var(--muted)' : '#dc2626' }}>
              {cancelMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
