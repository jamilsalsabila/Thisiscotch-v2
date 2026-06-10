/** Rp 45.000 */
export function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID')
}

/** Generate kode unik — sama dengan PHP generateCode() di v1 */
export function generateCode(prefix: string): string {
  const date = new Date()
  const d = date.getFullYear().toString().slice(2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `${prefix}-${d}-${rand}`
}

/** "2025-06-09" → "09 Jun 2025" */
export function formatDateDisplay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

/** Strip leading C from CAA/CAB/CAC → AA/AB/AC (semi-outdoor-2 table labels) */
export function tableLabel(id: string): string {
  return /^C([A-Z]+)$/.test(id) ? id.slice(1) : id
}
