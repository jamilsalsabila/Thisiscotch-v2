'use client'

import { useMemo, useState } from 'react'
import { createOrder } from '@/app/(public)/order/actions'
import { cancelRecord, lookupRecord } from '@/app/(public)/lookup/actions'
import { formatRupiah } from '@/utils/format'
import type { MenuItem, MenuLabels } from '@/lib/menu'
import { WordmarkLogo } from '@/components/ui/BrandLogo'
import { usePublicLanguage } from '@/components/layout/PublicLanguageProvider'

type CartItem = { id: number; nameEn: string; nameId: string; price: number; quantity: number }
type OrderLookup =
  Awaited<ReturnType<typeof lookupRecord>> & { type?: 'order' | 'booking' | 'waitlist' }

interface Props {
  categories: string[]
  grouped: Record<string, Record<string, MenuItem[]>>
  labels: MenuLabels
  isOpen: boolean
}

function getItemImage(item: MenuItem) {
  return item.image || '/assets/images/menu-placeholder.svg'
}

function statusColor(status: string) {
  if (status === 'cancelled') return '#dc2626'
  if (status === 'ready' || status === 'confirmed') return '#1a7a3a'
  if (status === 'preparing') return '#c41230'
  return '#d4941a'
}

export default function OrderClient({ categories, grouped, labels, isOpen }: Props) {
  const [activeTab, setTab] = useState('all')
  const lang = usePublicLanguage()
  const [cart, setCart] = useState<CartItem[]>([])
  const [submitting, setSub] = useState(false)
  const [orderCode, setCode] = useState('')
  const [error, setError] = useState('')
  const [cancelingTicket, setCancelingTicket] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupCode, setLookupCode] = useState('')
  const [lookupResult, setLookupResult] = useState<OrderLookup | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', tableNumber: '', notes: '' })

  const allTabs = useMemo(() => ['all', ...categories], [categories])
  const totalAmt = cart.reduce((sum, item) => sum + item.quantity * item.price, 0)

  function addToCart(item: MenuItem) {
    setCart(current => {
      const found = current.find(entry => entry.id === item.id)
      if (found) {
        return current.map(entry => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry)
      }
      return [...current, { id: item.id, nameEn: item.name_en, nameId: item.name_id || item.name_en, price: item.price, quantity: 1 }]
    })
  }

  function changeQty(id: number, delta: number) {
    setCart(current => current
      .map(entry => entry.id === id ? { ...entry, quantity: entry.quantity + delta } : entry)
      .filter(entry => entry.quantity > 0))
  }

  function setField(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(current => ({ ...current, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (cart.length === 0) return
    setSub(true)
    setError('')
    const res = await createOrder({
      guestName: form.name,
      guestPhone: form.phone,
      tableNumber: form.tableNumber,
      notes: form.notes,
      items: cart.map(item => ({
        id: item.id,
        name: lang === 'id' ? item.nameId : item.nameEn,
        price: item.price,
        quantity: item.quantity,
      })),
    })
    setSub(false)
    if (!res.success) {
      setError(res.error ?? (lang === 'id' ? 'Terjadi kesalahan.' : 'Something went wrong.'))
      return
    }
    setCode(res.orderCode!)
  }

  async function handleLookup() {
    if (!lookupCode.trim()) return
    setLookupLoading(true)
    const res = await lookupRecord(lookupCode)
    setLookupResult(res as OrderLookup)
    setLookupLoading(false)
  }

  async function handleCancelTicket() {
    if (!orderCode) return
    setCancelingTicket(true)
    const res = await cancelRecord('order', orderCode)
    setCancelingTicket(false)
    if (!res.success) {
      setError(res.error ?? (lang === 'id' ? 'Order tidak bisa dibatalkan.' : 'Order cannot be cancelled.'))
      return
    }
    resetOrder()
  }

  async function handleCancelLookup(code: string) {
    const res = await cancelRecord('order', code)
    if (!res.success) {
      setLookupResult({ success: false, error: res.error } as OrderLookup)
      return
    }
    const refreshed = await lookupRecord(code)
    setLookupResult(refreshed as OrderLookup)
  }

  function resetOrder() {
    setCode('')
    setCart([])
    setForm({ name: '', phone: '', tableNumber: '', notes: '' })
    setError('')
  }

  function renderItems(items: MenuItem[], category: string, subcategory?: string) {
    return (
      <div className="menu-grid">
        {items.map(item => {
          const inCart = cart.find(entry => entry.id === item.id)
          return (
            <div key={item.id} className="menu-card" data-aos="fade-up">
              <div className="menu-card__img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getItemImage(item)} alt={lang === 'id' ? (item.name_id || item.name_en) : item.name_en} loading="lazy" />
                {item.is_featured ? <span className="menu-card__badge-featured" data-copy-en="Featured" data-copy-id="Unggulan">{lang === 'id' ? 'Unggulan' : 'Featured'}</span> : null}
              </div>
              <div className="menu-card__body">
                <div className="menu-card__sub">
                  {subcategory && subcategory !== 'general'
                    ? subcategory
                    : ((lang === 'id' ? labels[category]?.id : labels[category]?.en) ?? category)}
                </div>
                <div className="menu-card__name">{lang === 'id' ? (item.name_id || item.name_en) : item.name_en}</div>
                <div className="menu-card__desc">{lang === 'id' ? (item.description_id || item.description_en) : (item.description_en || item.description_id)}</div>
                <div className="menu-card__footer">
                  <span className="menu-card__price">{formatRupiah(item.price)}</span>
                  {inCart ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button type="button" className="qty-btn" onClick={() => changeQty(item.id, -1)}>−</button>
                      <span className="qty-num">{inCart.quantity}</span>
                      <button type="button" className="qty-btn" onClick={() => changeQty(item.id, 1)}>+</button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="menu-card__add"
                      onClick={() => addToCart(item)}
                      title={lang === 'id' ? 'Tambahkan ke order' : 'Add to order'}
                      data-title-en="Add to order"
                      data-title-id="Tambahkan ke order"
                      aria-label={lang === 'id' ? 'Tambahkan ke order' : 'Add to order'}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--muted)' }}>
        <p style={{ fontWeight: 600, marginBottom: 8 }} data-copy-en="Menu is not available yet" data-copy-id="Menu belum tersedia">{lang === 'id' ? 'Menu belum tersedia' : 'Menu is not available yet'}</p>
        <p style={{ fontSize: '.875rem' }} data-copy-en="Add menu items in Supabase to start receiving orders." data-copy-id="Tambahkan item menu di Supabase untuk mulai menerima order.">{lang === 'id' ? 'Tambahkan item menu di Supabase untuk mulai menerima order.' : 'Add menu items in Supabase to start receiving orders.'}</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid-sidebar">
        <div>
          <div className="menu-tabs">
            {allTabs.map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                type="button"
                onClick={() => setTab(tab)}
              >
                {tab === 'all' ? (lang === 'id' ? 'Semua' : 'All') : (lang === 'id' ? labels[tab]?.id : labels[tab]?.en) ?? tab}
              </button>
            ))}
          </div>

          {activeTab === 'all' ? (
            <div id="tab-all">
              {categories.map(category => {
                const subgroups = grouped[category]
                if (!subgroups) return null

                return (
                  <div key={category} style={{ marginBottom: 56 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                      <h2 className="menu-cat-heading">
                        {(lang === 'id' ? labels[category]?.id : labels[category]?.en) ?? category}
                      </h2>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>

                    {Object.entries(subgroups).map(([subcategory, items]) => (
                      <div key={subcategory || 'general'} style={{ marginBottom: 32 }}>
                        {subcategory && subcategory !== 'general' ? (
                          <h4
                            style={{
                              fontSize: '.85rem',
                              fontWeight: 600,
                              letterSpacing: '.06em',
                              textTransform: 'uppercase',
                              color: 'var(--muted)',
                              marginBottom: 16,
                              paddingBottom: 6,
                              borderBottom: '1px solid var(--border)',
                            }}
                          >
                            {subcategory}
                          </h4>
                        ) : null}

                        {renderItems(items, category, subcategory)}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ) : (
            <div id={`tab-${activeTab}`}>
              {Object.entries(grouped[activeTab] || {}).map(([subcategory, items]) => (
                <div key={subcategory || 'general'} style={{ marginBottom: 40 }}>
                  {subcategory && subcategory !== 'general' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{subcategory}</h3>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>
                  ) : null}

                  {renderItems(items, activeTab, subcategory)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cart-sidebar">
          <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }} data-copy-en="Your Order" data-copy-id="Pesanan Anda">{lang === 'id' ? 'Pesanan Anda' : 'Your Order'}</h3>

          {cart.length === 0 ? (
            <div className="cart-empty" data-copy-en="Your order is empty." data-copy-id="Pesanan Anda masih kosong.">{lang === 'id' ? 'Pesanan Anda masih kosong.' : 'Your order is empty.'}</div>
          ) : (
            <>
              <div id="cartItems">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item__info">
                      <div className="cart-item__name">{lang === 'id' ? item.nameId : item.nameEn}</div>
                      <div className="cart-item__price">{formatRupiah(item.price)}</div>
                    </div>
                    <div className="cart-item__qty">
                      <button type="button" className="qty-btn" onClick={() => changeQty(item.id, -1)}>−</button>
                      <span className="qty-num">{item.quantity}</span>
                      <button type="button" className="qty-btn" onClick={() => changeQty(item.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div id="cartSummary">
                <div className="cart-total">
                  <div className="cart-total__row total">
                    <span data-copy-en="Total" data-copy-id="Total">Total</span>
                    <span>{formatRupiah(totalAmt)}</span>
                  </div>
                </div>

                <hr className="divider" style={{ margin: '16px 0' }} />

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label" data-copy-en="Your Name" data-copy-id="Nama Anda">{lang === 'id' ? 'Nama Anda' : 'Your Name'}</label>
                    <input className="form-input" required value={form.name} onChange={setField('name')} placeholder={lang === 'id' ? 'Nama' : 'Name'} data-placeholder-en="Name" data-placeholder-id="Nama" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" data-copy-en="WhatsApp Number" data-copy-id="Nomor WhatsApp">{lang === 'id' ? 'Nomor WhatsApp' : 'WhatsApp Number'}</label>
                    <input className="form-input" required type="tel" value={form.phone} onChange={setField('phone')} placeholder="+62..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label" data-copy-en="Table Number (optional)" data-copy-id="Nomor Meja (opsional)">{lang === 'id' ? 'Nomor Meja (opsional)' : 'Table Number (optional)'}</label>
                    <input className="form-input" value={form.tableNumber} onChange={setField('tableNumber')} placeholder={lang === 'id' ? 'mis. T3 atau O1' : 'e.g. T3 or O1'} data-placeholder-en="e.g. T3 or O1" data-placeholder-id="mis. T3 atau O1" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" data-copy-en="Notes" data-copy-id="Catatan">{lang === 'id' ? 'Catatan' : 'Notes'}</label>
                    <textarea className="form-textarea" style={{ minHeight: 70 }} value={form.notes} onChange={setField('notes')} placeholder={lang === 'id' ? 'mis. less sugar, oat milk...' : 'e.g. less sugar, oat milk...'} data-placeholder-en="e.g. less sugar, oat milk..." data-placeholder-id="mis. less sugar, oat milk..." />
                  </div>

                  {error ? (
                    <div style={{ background: 'rgba(220,38,38,.08)', border: '1.5px solid #dc2626', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14, color: '#dc2626', fontSize: '.82rem' }}>
                      {error}
                    </div>
                  ) : null}

                  <button type="submit" className={`btn btn--primary w-full${submitting ? ' btn--loading' : ''}`} style={{ justifyContent: 'center' }} disabled={submitting || !isOpen}>
                    {submitting ? '' : isOpen ? (lang === 'id' ? 'Buat Pesanan' : 'Place Order') : (lang === 'id' ? 'Cafe Tutup — Order Dinonaktifkan' : 'Cafe Closed — Order Disabled')}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: 48 }}>
        <div className="lookup-box">
          <h3 style={{ marginBottom: 8 }} data-copy-en="Track My Order" data-copy-id="Lacak Pesanan Saya">{lang === 'id' ? 'Lacak Pesanan Saya' : 'Track My Order'}</h3>
          <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: 14 }} data-copy-en="Enter your order code to check status." data-copy-id="Masukkan kode order Anda untuk cek status.">{lang === 'id' ? 'Masukkan kode order Anda untuk cek status.' : 'Enter your order code to check status.'}</p>
          <div className="lookup-actions-row" style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              className="form-input"
              value={lookupCode}
              onChange={e => setLookupCode(e.target.value.toUpperCase())}
              placeholder={lang === 'id' ? 'mis. ORD-250517-AB3XY' : 'e.g. ORD-250517-AB3XY'}
              data-placeholder-en="e.g. ORD-250517-AB3XY"
              data-placeholder-id="mis. ORD-250517-AB3XY"
              style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
            />
            <button type="button" className={`btn btn--outline btn--sm${lookupLoading ? ' btn--loading' : ''}`} onClick={() => void handleLookup()} disabled={lookupLoading}>
              {lookupLoading ? '' : (lang === 'id' ? 'Cari' : 'Look Up')}
            </button>
          </div>
          {lookupResult?.success === false ? (
            <p style={{ color: 'var(--red)', fontSize: '.85rem', marginTop: 12 }}>{lookupResult.error}</p>
          ) : null}
          {lookupResult?.success && lookupResult.type !== 'order' ? (
            <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginTop: 12 }}>
              {lang === 'id' ? `Ini kode ${lookupResult.type}. ` : `This is a ${lookupResult.type} code. `}
              <a href="/lookup" style={{ color: 'var(--red)' }}>{lang === 'id' ? 'Lihat di sini →' : 'View here →'}</a>
            </p>
          ) : null}
          {lookupResult?.success && lookupResult.type === 'order' ? (
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 16, marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong>{lookupResult.data.order_code}</strong>
                <span style={{ color: statusColor(lookupResult.data.status), fontWeight: 700, fontSize: '.82rem', textTransform: 'capitalize' }}>
                  ● {lookupResult.data.status === 'pending'
                    ? (lang === 'id' ? 'menunggu' : 'pending')
                    : lookupResult.data.status === 'confirmed'
                      ? (lang === 'id' ? 'dikonfirmasi' : 'confirmed')
                      : lookupResult.data.status === 'preparing'
                        ? (lang === 'id' ? 'disiapkan' : 'preparing')
                        : lookupResult.data.status === 'ready'
                          ? (lang === 'id' ? 'siap' : 'ready')
                          : lookupResult.data.status === 'completed'
                            ? (lang === 'id' ? 'selesai' : 'completed')
                            : lookupResult.data.status === 'cancelled'
                              ? (lang === 'id' ? 'dibatalkan' : 'cancelled')
                              : lookupResult.data.status}
                </span>
              </div>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
                {lookupResult.data.guest_name} · {lang === 'id' ? 'Meja' : 'Table'} {lookupResult.data.table_number || '—'} · Total: {formatRupiah(Number(lookupResult.data.total_amount))}
              </p>
              {['pending', 'confirmed'].includes(lookupResult.data.status) ? (
                <button type="button" className="btn btn--danger btn--sm" style={{ marginTop: 12 }} onClick={() => void handleCancelLookup(lookupResult.data.order_code)}>
                  {lang === 'id' ? 'Batalkan Pesanan' : 'Cancel Order'}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {orderCode ? (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ padding: 0, maxWidth: 440, background: 'transparent' }}>
            <div className="ticket">
              <div className="ticket__header" style={{ background: '#1a1a1a' }}>
                <WordmarkLogo />
                <div className="ticket__type" data-copy-en="Order Confirmation" data-copy-id="Konfirmasi Order">{lang === 'id' ? 'Konfirmasi Order' : 'Order Confirmation'}</div>
                <div className="ticket__code">{orderCode}</div>
              </div>
              <div className="ticket__body">
                <div className="ticket__row">
                  <span className="ticket__key" data-copy-en="Name" data-copy-id="Nama">{lang === 'id' ? 'Nama' : 'Name'}</span>
                  <span className="ticket__val">{form.name}</span>
                </div>
                <div className="ticket__row">
                  <span className="ticket__key" data-copy-en="Table" data-copy-id="Meja">{lang === 'id' ? 'Meja' : 'Table'}</span>
                  <span className="ticket__val">{form.tableNumber || '—'}</span>
                </div>
                <div style={{ padding: '8px 0', borderBottom: '1px dashed var(--border)' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', padding: '4px 0' }}>
                      <span>{lang === 'id' ? item.nameId : item.nameEn} × {item.quantity}</span>
                      <span>{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="ticket__row">
                  <span className="ticket__key" data-copy-en="Total" data-copy-id="Total">Total</span>
                  <span className="ticket__val" style={{ color: 'var(--red)', fontWeight: 700 }}>{formatRupiah(totalAmt)}</span>
                </div>
                <div className="ticket__row">
                  <span className="ticket__key" data-copy-en="Status" data-copy-id="Status">Status</span>
                  <span className="ticket__val">
                    <span className="ticket__status active" data-copy-en="● Pending" data-copy-id="● Menunggu">{lang === 'id' ? '● Menunggu' : '● Pending'}</span>
                  </span>
                </div>
              </div>
              <div className="ticket__footer">
                <p data-copy-en="Your order has been received. Show this to our staff." data-copy-id="Order Anda sudah kami terima. Tunjukkan ini kepada staf kami.">{lang === 'id' ? 'Order Anda sudah kami terima. Tunjukkan ini kepada staf kami.' : 'Your order has been received. Show this to our staff.'}</p>
                <div className="ticket-actions-row" style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'center' }}>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={resetOrder}><span data-copy-en="Close" data-copy-id="Tutup">{lang === 'id' ? 'Tutup' : 'Close'}</span></button>
                  <button type="button" className={`btn btn--danger btn--sm${cancelingTicket ? ' btn--loading' : ''}`} onClick={() => void handleCancelTicket()} disabled={cancelingTicket}>
                    {cancelingTicket ? '' : (lang === 'id' ? 'Batalkan Pesanan' : 'Cancel Order')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
