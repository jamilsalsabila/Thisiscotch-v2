'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBooking, getBookedTableIds } from '@/app/(public)/booking/actions'
import { cancelRecord } from '@/app/(public)/lookup/actions'
import { formatDateDisplay } from '@/utils/format'
import type { Database } from '@/types/database'
import LegacyIcon from '@/components/ui/LegacyIcon'
import { WordmarkLogo } from '@/components/ui/BrandLogo'
import { usePublicLanguage } from '@/components/layout/PublicLanguageProvider'

type FloorTable = Database['public']['Tables']['floor_tables']['Row']
type Section = 'indoor' | 'semi-outdoor-1' | 'semi-outdoor-2'

const VIEWBOX = '0 0 8000 5716'

const BG_IMG: Record<Section, string> = {
  'indoor':         '/assets/images/floorplan-indoor.svg',
  'semi-outdoor-1': '/assets/images/floorplan-semi-outdoor1.svg',
  'semi-outdoor-2': '/assets/images/floorplan-semi-outdoor2.svg',
}

// Display labels match old PHP sectionLabels (sections are "swapped" vs display)
const SECTION_LABELS: Record<Section, { en: string; id: string }> = {
  'indoor':         { en: 'Indoor', id: 'Indoor' },
  'semi-outdoor-1': { en: 'Semi-Outdoor 2', id: 'Semi-Outdoor 2' },
  'semi-outdoor-2': { en: 'Semi-Outdoor 1', id: 'Semi-Outdoor 1' },
}

// Tab order: Indoor → Semi-Outdoor 1 → Semi-Outdoor 2
const SECTION_TABS: Section[] = ['indoor', 'semi-outdoor-2', 'semi-outdoor-1']

type TableDef = { id: string; label?: string; cap: number; x: number; y: number; w: number; h: number }

// Exact coordinates from booking.js — viewBox 8000×5716
const ALL_TABLES: Record<Section, TableDef[]> = {
  indoor: [
    { id: 'AC', cap: 4, x: 1432, y: 1488, w: 415, h: 222 },
    { id: 'AB', cap: 4, x: 1432, y: 1971, w: 415, h: 222 },
    { id: 'AA', cap: 4, x: 1431, y: 2429, w: 417, h: 227 },
    { id: 'B',  cap: 4, x: 2302, y: 1602, w: 196, h: 340 },
    { id: 'A',  cap: 4, x: 2297, y: 2215, w: 190, h: 335 },
    { id: 'C',  cap: 4, x: 2893, y: 1580, w: 332, h: 192 },
    { id: 'D',  cap: 4, x: 3521, y: 1879, w: 318, h: 318 },
    { id: 'E',  cap: 4, x: 4313, y: 1891, w: 302, h: 303 },
    { id: 'G',  cap: 4, x: 4817, y: 1890, w: 300, h: 301 },
    { id: 'I',  cap: 4, x: 5329, y: 1886, w: 302, h: 303 },
    { id: 'F',  cap: 2, x: 4563, y: 1428, w: 210, h: 295 },
    { id: 'H',  cap: 4, x: 5071, y: 1439, w: 210, h: 282 },
    { id: 'J',  cap: 4, x: 5565, y: 1433, w: 208, h: 282 },
    { id: 'K',  cap: 4, x: 5480, y: 2716, w: 209, h: 362 },
    { id: 'Q',  cap: 4, x: 2307, y: 3427, w: 184, h: 327 },
    { id: 'P',  cap: 4, x: 2303, y: 3943, w: 184, h: 327 },
    { id: 'O',  cap: 4, x: 2880, y: 4085, w: 321, h: 185 },
    { id: 'L',  cap: 4, x: 5356, y: 3464, w: 300, h: 301 },
    { id: 'M',  cap: 4, x: 5367, y: 3978, w: 299, h: 313 },
    { id: 'N',  cap: 4, x: 4783, y: 4000, w: 303, h: 303 },
  ],
  // Garden area (displayed as "Semi-Outdoor 2")
  'semi-outdoor-1': [
    { id: 'GA',  cap: 4, x: 2476, y: 1308, w: 164, h: 386 },
    { id: 'GB',  cap: 4, x: 2476, y: 1773, w: 164, h: 387 },
    { id: 'GC',  cap: 4, x: 2476, y: 2627, w: 164, h: 387 },
    { id: 'GD',  cap: 4, x: 2476, y: 3112, w: 164, h: 386 },
    { id: 'D1',  cap: 4, x: 3104, y: 3927, w: 210, h: 360 },
    { id: 'D2',  cap: 4, x: 3608, y: 3921, w: 208, h: 371 },
    { id: 'D3',  cap: 4, x: 4131, y: 3921, w: 208, h: 364 },
    { id: 'D4',  cap: 4, x: 4653, y: 3921, w: 208, h: 359 },
    { id: 'D5',  cap: 4, x: 5186, y: 3921, w: 209, h: 371 },
    { id: 'D13', cap: 4, x: 2652, y: 4794, w: 238, h: 134 },
    { id: 'D12', cap: 4, x: 2975, y: 4797, w: 229, h: 131 },
    { id: 'D11', cap: 2, x: 3462, y: 4792, w: 221, h: 131 },
    { id: 'D10', cap: 2, x: 3789, y: 4804, w: 235, h: 130 },
    { id: 'D9',  cap: 2, x: 4120, y: 4796, w: 230, h: 129 },
    { id: 'D8',  cap: 2, x: 4440, y: 4796, w: 218, h: 134 },
    { id: 'D7',  cap: 2, x: 4767, y: 4803, w: 236, h: 130 },
    { id: 'D6',  cap: 4, x: 5277, y: 4701, w: 128, h: 241 },
  ],
  // Yard area (displayed as "Semi-Outdoor 1")
  'semi-outdoor-2': [
    { id: 'CAC', label: 'AC', cap: 4, x: 881,  y: 2042, w: 406, h: 208 },
    { id: 'CAB', label: 'AB', cap: 4, x: 881,  y: 2638, w: 406, h: 208 },
    { id: 'CAA', label: 'AA', cap: 4, x: 881,  y: 3214, w: 406, h: 209 },
    { id: 'AD',  cap: 4, x: 1771, y: 1584, w: 314, h: 273 },
    { id: 'AE',  cap: 4, x: 2659, y: 1572, w: 330, h: 286 },
    { id: 'AH',  cap: 2, x: 1736, y: 2179, w: 379, h: 381 },
    { id: 'AF',  cap: 4, x: 2603, y: 2652, w: 324, h: 622 },
    { id: 'AG',  cap: 4, x: 1735, y: 2886, w: 380, h: 381 },
    { id: 'BA',  cap: 4, x: 5579, y: 2311, w: 306, h: 755 },
    { id: 'BB',  cap: 4, x: 6414, y: 2332, w: 305, h: 736 },
    { id: 'CA',  cap: 4, x: 1500, y: 3676, w: 276, h: 533 },
    { id: 'CB',  cap: 4, x: 2435, y: 3691, w: 275, h: 532 },
    { id: 'CC',  cap: 4, x: 3290, y: 3691, w: 275, h: 532 },
    { id: 'CD',  cap: 4, x: 4139, y: 3684, w: 275, h: 532 },
    { id: 'CE',  cap: 4, x: 5036, y: 3676, w: 276, h: 533 },
    { id: 'CF',  cap: 4, x: 5897, y: 3677, w: 275, h: 532 },
  ],
}

function getDisplayLabel(def: TableDef) { return def.label ?? def.id }

const TIME_SLOTS = Array.from({ length: 19 }, (_, i) => {
  const h = Math.floor(i / 2) + 12
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

const TODAY = new Date().toISOString().split('T')[0]

type BookingResult = { bookingCode: string; tableId: string; tableLabel: string; section: Section; date: string; time: string; name: string; partySize: number }

interface Props { tables: FloorTable[] }

export default function BookingClient({ tables }: Props) {
  const lang = usePublicLanguage()
  const [activeSection, setSection]     = useState<Section>('indoor')
  const [selectedDate, setDate]         = useState(TODAY)
  const [selectedTime, setTime]         = useState('12:00')
  const [selectedTableId, setTableId]   = useState<string | null>(null)
  const [bookedIds, setBookedIds]       = useState<string[]>([])
  const [loadingAvail, setLoadingAvail] = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [result, setResult]             = useState<BookingResult | null>(null)
  const [cancelingResult, setCancelingResult] = useState(false)
  const [error, setError]               = useState('')
  const [form, setForm] = useState({ name: '', phone: '', email: '', partySize: '2', specialRequest: '' })

  const fetchAvailability = useCallback(async (date: string, time: string) => {
    setLoadingAvail(true)
    try {
      const ids = await getBookedTableIds(date, time)
      setBookedIds(ids)
      setTableId(current => (current && ids.includes(current) ? null : current))
    } finally {
      setLoadingAvail(false)
    }
  }, [])

  useEffect(() => {
    void fetchAvailability(selectedDate, selectedTime)
  }, [fetchAvailability, selectedDate, selectedTime])

  function handleDateChange(d: string) { setDate(d) }
  function handleTimeChange(t: string) { setTime(t) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTableId) return
    setSubmitting(true); setError('')

    const res = await createBooking({
      tableId: selectedTableId,
      section: activeSection,
      capacity: selectedDef?.cap ?? Number(form.partySize),
      guestName: form.name,
      guestPhone: form.phone,
      guestEmail: form.email,
      partySize: Number(form.partySize),
      bookingDate: selectedDate,
      bookingTime: selectedTime,
      specialRequest: form.specialRequest,
    })

    setSubmitting(false)
    if (!res.success) {
      setError(res.error ?? (lang === 'id' ? 'Terjadi kesalahan.' : 'Something went wrong.'))
      return
    }

    const def = ALL_TABLES[activeSection].find(d => d.id === selectedTableId)
    setResult({
      bookingCode: res.bookingCode!,
      tableId: selectedTableId,
      tableLabel: def ? getDisplayLabel(def) : selectedTableId,
      section: activeSection,
      date: selectedDate,
      time: selectedTime,
      name: form.name,
      partySize: Number(form.partySize),
    })
    setBookedIds(current => current.includes(selectedTableId) ? current : [...current, selectedTableId])
    setForm({ name: '', phone: '', email: '', partySize: '2', specialRequest: '' })
  }

  function resetForm() {
    setResult(null); setTableId(null); setError('')
    setForm({ name: '', phone: '', email: '', partySize: '2', specialRequest: '' })
  }

  async function handleCancelFromTicket() {
    if (!result) return
    setCancelingResult(true)
    const res = await cancelRecord('booking', result.bookingCode)
    setCancelingResult(false)
    if (!res.success) {
      setError(res.error ?? (lang === 'id' ? 'Booking tidak bisa dibatalkan.' : 'Booking cannot be cancelled.'))
      return
    }
    resetForm()
    await fetchAvailability(selectedDate, selectedTime)
  }

  // Legacy PHP always rendered the full floorplan. Only hide tables that are explicitly inactive in DB.
  const inactiveIds = new Set(
    tables
      .filter(t => t.section === activeSection && !t.is_active)
      .map(t => t.id)
  )
  const sectionDefs = ALL_TABLES[activeSection].filter(d => !inactiveIds.has(d.id))

  const selectedDef = selectedTableId
    ? ALL_TABLES[activeSection].find(d => d.id === selectedTableId)
    : null

  return (
    <>
      {/* Date & Time bar */}
      <div className="booking-datetime-row" style={{ background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: 32, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ flex: 1, minWidth: 150, maxWidth: 260 }}>
          <label className="form-label" data-copy-en="Date" data-copy-id="Tanggal">{lang === 'id' ? 'Tanggal' : 'Date'}</label>
          <input className="form-input" type="date" value={selectedDate} min={TODAY}
            onChange={e => handleDateChange(e.target.value)} />
        </div>
        <div style={{ flex: 1, minWidth: 140, maxWidth: 220 }}>
          <label className="form-label" data-copy-en="Time" data-copy-id="Waktu">{lang === 'id' ? 'Waktu' : 'Time'}</label>
          <select className="form-select" value={selectedTime} onChange={e => handleTimeChange(e.target.value)}>
            {TIME_SLOTS.map(t => <option key={t} value={t}>{t} WIB</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 200, maxWidth: 300 }}>
          <div style={{ fontSize: '.82rem', color: 'var(--muted)', paddingBottom: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--gold)' }}>
              <LegacyIcon name="bolt" size={15} />
              <span data-copy-en="Select a table on the floor plan" data-copy-id="Pilih meja pada denah lantai">{lang === 'id' ? 'Pilih meja pada denah lantai' : 'Select a table on the floor plan'}</span>
            </span>
          </div>
          {loadingAvail && <div style={{ color: 'var(--muted)', fontSize: '.8rem' }} data-copy-en="Loading availability…" data-copy-id="Memuat ketersediaan…">{lang === 'id' ? 'Memuat ketersediaan…' : 'Loading availability…'}</div>}
        </div>
      </div>

      {/* Section tabs */}
      <div className="floor-plan__tabs" style={{ marginBottom: 20 }}>
        {SECTION_TABS.map(s => (
          <button key={s} className={`tab-btn${activeSection === s ? ' active' : ''}`}
            onClick={() => { setSection(s); setTableId(null) }}>
            {SECTION_LABELS[s][lang]}
          </button>
        ))}
      </div>

      {/* Side-by-side: floor plan (left) + form (right) */}
      <div className="booking-layout">

        {/* Floor plan with SVG background image + interactive overlays */}
        <div className="floor-plan">
          <svg
            className="floor-svg"
            viewBox={VIEWBOX}
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            {/* Background floor plan image */}
            <image href={BG_IMG[activeSection]} x="0" y="0" width="8000" height="5716" />

            {/* Clickable table overlays */}
            {sectionDefs.map(def => {
              const isBooked   = bookedIds.includes(def.id)
              const isSelected = selectedTableId === def.id
              const cls = isBooked ? 'booked' : isSelected ? 'selected' : 'available'
              const cx = def.x + def.w / 2
              const cy = def.y + def.h / 2

              return (
                <g
                  key={def.id}
                  className={`floor-table ${cls}`}
                  onClick={() => { if (!isBooked) { setTableId(def.id); setError('') } }}
                  style={{ cursor: isBooked ? 'not-allowed' : 'pointer' }}
                >
                  <rect x={def.x} y={def.y} width={def.w} height={def.h} />
                  <text x={cx} y={cy - 20} textAnchor="middle" dominantBaseline="middle">
                    {getDisplayLabel(def)}
                  </text>
                  <text x={cx} y={cy + 40} textAnchor="middle" dominantBaseline="middle" className="floor-table-cap">
                    {def.cap} pax
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Legend */}
          <div className="floor-legend">
            {[
              { color: '#d4edda', border: '#22863a', labelEn: 'Available', labelId: 'Tersedia' },
              { color: '#f8d7da', border: '#c0392b', labelEn: 'Booked', labelId: 'Sudah Dipesan' },
              { color: '#fde68a', border: '#d4941a', labelEn: 'Selected', labelId: 'Terpilih' },
            ].map(({ color, border, labelEn, labelId }) => (
              <div key={labelEn} className="floor-legend__item">
                <div className="floor-legend__dot" style={{ background: color, border: `1.5px solid ${border}` }} />
                {lang === 'id' ? labelId : labelEn}
              </div>
            ))}
          </div>

          <div id="selectedTableInfo" className="selected-table-info" style={{ display: 'block', marginTop: 16 }}>
            {selectedTableId && selectedDef
              ? (
                <>
                  <span data-copy-en="Selected table:" data-copy-id="Meja terpilih:">{lang === 'id' ? 'Meja terpilih:' : 'Selected table:'}</span> <strong>{SECTION_LABELS[activeSection][lang]} — {getDisplayLabel(selectedDef)}</strong>
                  {' · '}{selectedDef.cap} pax{' · '}{formatDateDisplay(selectedDate)} · {selectedTime}
                </>
              )
              : <span data-copy-en="Select a table above" data-copy-id="Pilih meja di atas">{lang === 'id' ? 'Pilih meja di atas' : 'Select a table above'}</span>}
          </div>

          <div style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(212,148,26,.08)', borderRadius: 'var(--radius-sm)', fontSize: '.82rem', color: 'var(--muted)' }}>
            <span data-copy-en="All tables booked?" data-copy-id="Semua meja sudah dipesan?">{lang === 'id' ? 'Semua meja sudah dipesan?' : 'All tables booked?'}</span> <a href="/waitlist" style={{ color: 'var(--gold)', fontWeight: 600 }} data-copy-en="Join the waitlist →" data-copy-id="Masuk daftar tunggu →">{lang === 'id' ? 'Masuk daftar tunggu →' : 'Join the waitlist →'}</a>
          </div>
        </div>

        {/* Booking form */}
        <div>
          <form className="booking-form" onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: 20, fontSize: '1.2rem' }} data-copy-en="Your Details" data-copy-id="Detail Anda">{lang === 'id' ? 'Detail Anda' : 'Your Details'}</h3>

            <div className="form-group">
              <label className="form-label" data-copy-en="Full Name" data-copy-id="Nama Lengkap">{lang === 'id' ? 'Nama Lengkap' : 'Full Name'}</label>
              <input className="form-input" required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your name" data-placeholder-en="Your name" data-placeholder-id="Nama Anda" />
            </div>
            <div className="form-group">
              <label className="form-label" data-copy-en="WhatsApp Number" data-copy-id="Nomor WhatsApp">{lang === 'id' ? 'Nomor WhatsApp' : 'WhatsApp Number'}</label>
              <input className="form-input" required type="tel" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+62..." />
            </div>
            <div className="form-group">
              <label className="form-label" data-copy-en="Email (optional)" data-copy-id="Email (opsional)">{lang === 'id' ? 'Email (opsional)' : 'Email (optional)'}</label>
              <input className="form-input" type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com" data-placeholder-en="your@email.com" data-placeholder-id="email@anda.com" />
            </div>
            <div className="form-group">
              <label className="form-label" data-copy-en="Party Size" data-copy-id="Jumlah Tamu">{lang === 'id' ? 'Jumlah Tamu' : 'Party Size'}</label>
              <select className="form-select" value={form.partySize}
                onChange={e => setForm(f => ({ ...f, partySize: e.target.value }))}>
                  {Array.from({ length: selectedDef?.cap ?? 6 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n} pax</option>
                  ))}
              </select>
              <p className="form-hint" data-copy-en="Max capacity depends on selected table." data-copy-id="Kapasitas maksimal tergantung meja yang dipilih.">{lang === 'id' ? 'Kapasitas maksimal tergantung meja yang dipilih.' : 'Max capacity depends on selected table.'}</p>
            </div>
            <div className="form-group">
              <label className="form-label" data-copy-en="Special Request" data-copy-id="Permintaan Khusus">{lang === 'id' ? 'Permintaan Khusus' : 'Special Request'}</label>
              <textarea className="form-textarea" value={form.specialRequest}
                onChange={e => setForm(f => ({ ...f, specialRequest: e.target.value }))}
                placeholder="e.g. birthday setup, wheelchair access..." data-placeholder-en="e.g. birthday setup, wheelchair access..." data-placeholder-id="mis. dekor ulang tahun, akses kursi roda..." />
            </div>

            {error && (
              <div style={{ background: 'rgba(220,38,38,.08)', border: '1.5px solid #dc2626', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 20, color: '#dc2626', fontSize: '.875rem' }}>
                {error}
              </div>
            )}

            <button type="submit" className={`btn btn--primary w-full${submitting ? ' btn--loading' : ''}`}
              style={{ justifyContent: 'center' }}
              disabled={submitting || !selectedTableId}>
              {submitting ? '' : <span data-copy-en="Confirm Reservation" data-copy-id="Konfirmasi Reservasi">{lang === 'id' ? 'Konfirmasi Reservasi' : 'Confirm Reservation'}</span>}
            </button>
          </form>
          <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 14, textAlign: 'center' }}>
            <span data-copy-en="Need to cancel? Use the code on your ticket at any time." data-copy-id="Perlu membatalkan? Gunakan kode pada tiket Anda kapan saja.">{lang === 'id' ? 'Perlu membatalkan? Gunakan kode pada tiket Anda kapan saja.' : 'Need to cancel? Use the code on your ticket at any time.'}</span>
          </p>
        </div>
      </div>

      {/* Success modal overlay */}
      {result && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ padding: 0, maxWidth: 440, background: 'transparent' }}>
            <div className="ticket">
              <div className="ticket__header">
                <WordmarkLogo />
                <div className="ticket__type" data-copy-en="Table Reservation" data-copy-id="Reservasi Meja">{lang === 'id' ? 'Reservasi Meja' : 'Table Reservation'}</div>
                <div className="ticket__code">{result.bookingCode}</div>
              </div>
              <div className="ticket__body">
                {[
                  { k: lang === 'id' ? 'Tamu' : 'Guest', v: result.name },
                  { k: lang === 'id' ? 'Meja' : 'Table', v: result.tableLabel },
                  { k: lang === 'id' ? 'Area' : 'Section', v: SECTION_LABELS[result.section][lang] },
                  { k: lang === 'id' ? 'Jumlah Tamu' : 'Party', v: `${result.partySize} pax` },
                  { k: lang === 'id' ? 'Tanggal' : 'Date', v: formatDateDisplay(result.date) },
                  { k: lang === 'id' ? 'Waktu' : 'Time', v: result.time },
                ].map(({ k, v }) => (
                  <div key={k} className="ticket__row">
                    <span className="ticket__key">{k}</span>
                    <span className="ticket__val">{v}</span>
                  </div>
                ))}
                <div className="ticket__row">
                  <span className="ticket__key" data-copy-en="Status" data-copy-id="Status">Status</span>
                  <span className="ticket__val">
                    <span className="ticket__status active" data-copy-en="● Active" data-copy-id="● Aktif">{lang === 'id' ? '● Aktif' : '● Active'}</span>
                  </span>
                </div>
              </div>
              <div className="ticket__footer">
                <p data-copy-en="Show this ticket to our staff upon arrival." data-copy-id="Tunjukkan tiket ini kepada staf kami saat tiba.">{lang === 'id' ? 'Tunjukkan tiket ini kepada staf kami saat tiba.' : 'Show this ticket to our staff upon arrival.'}</p>
                <p style={{ marginTop: 4, fontSize: '.7rem' }} data-copy-en="Please arrive within 15 minutes of your reserved time." data-copy-id="Mohon datang dalam waktu 15 menit dari jam reservasi Anda.">{lang === 'id' ? 'Mohon datang dalam waktu 15 menit dari jam reservasi Anda.' : 'Please arrive within 15 minutes of your reserved time.'}</p>
                <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'center' }}>
                  <button className="btn btn--ghost btn--sm" onClick={resetForm}><span data-copy-en="Close" data-copy-id="Tutup">{lang === 'id' ? 'Tutup' : 'Close'}</span></button>
                  <button className={`btn btn--danger btn--sm${cancelingResult ? ' btn--loading' : ''}`} onClick={() => void handleCancelFromTicket()} disabled={cancelingResult}>
                    {cancelingResult ? '' : <span data-copy-en="Cancel Booking" data-copy-id="Batalkan Booking">{lang === 'id' ? 'Batalkan Booking' : 'Cancel Booking'}</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
