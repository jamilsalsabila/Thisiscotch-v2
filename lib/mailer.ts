import net from 'node:net'
import tls from 'node:tls'

type OrderMailItem = {
  item_name: string
  quantity: number
  subtotal: number
}

type OrderNotificationPayload = {
  order_code: string
  guest_name: string
  guest_phone: string
  table_number?: string | null
  notes?: string | null
  total_amount: number
  items: OrderMailItem[]
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'cotch.data@gmail.com'
const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const MAIL_SMTP_HOST = process.env.MAIL_SMTP_HOST || ''
const MAIL_SMTP_PORT = Number(process.env.MAIL_SMTP_PORT || 587)
const MAIL_SMTP_USER = process.env.MAIL_SMTP_USER || ''
const MAIL_SMTP_PASS = process.env.MAIL_SMTP_PASS || ''
const MAIL_FROM = process.env.MAIL_FROM || MAIL_SMTP_USER || 'no-reply@cotch.local'
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'Cotch Reservation'

function hasPlaceholderValue(value: string) {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return true
  return [
    'replace-with-active-smtp-app-password',
    'your-smtp-password',
    'your-smtp-user@example.com',
  ].includes(normalized)
}

export function getMailConfigurationStatus() {
  const hostReady = !hasPlaceholderValue(MAIL_SMTP_HOST)
  const userReady = !hasPlaceholderValue(MAIL_SMTP_USER)
  const passReady = !hasPlaceholderValue(MAIL_SMTP_PASS)

  return {
    enabled: hostReady && userReady && passReady,
    hostReady,
    userReady,
    passReady,
    adminEmail: ADMIN_EMAIL,
    fromEmail: MAIL_FROM,
    fromName: MAIL_FROM_NAME,
    siteUrl: SITE_URL,
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

function logMail(target: string, subject: string, status: string) {
  console.info(`[mail] ${status} :: ${target} :: ${subject}`)
}

function orderEmailHtml(order: OrderNotificationPayload) {
  const itemRows = order.items.map(item => `
    <div class='row'>
      <span class='label'>${escapeHtml(item.item_name)} ×${item.quantity}</span>
      <span class='val'>${formatNumber(item.subtotal)}</span>
    </div>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charSet='UTF-8'>
<style>
  body{font-family:Inter,Arial,sans-serif;background:#f5f0e8;margin:0;padding:24px}
  .card{background:#fff;border-radius:12px;max-width:480px;margin:0 auto;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  h2{color:#C41230;margin:0 0 4px}
  .sub{color:#888;font-size:.875rem;margin-bottom:24px}
  .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0ece4;font-size:.9rem;gap:16px}
  .row:last-child{border-bottom:none}
  .label{color:#888}
  .val{font-weight:600;color:#1a1a1a;text-align:right}
  .divider{border:none;border-top:2px dashed #f0ece4;margin:4px 0}
  .total{display:flex;justify-content:space-between;padding:12px 0;font-size:1rem;font-weight:700}
  .code{background:#f5f0e8;padding:8px 14px;border-radius:6px;font-family:monospace;font-size:1rem;color:#C41230;display:inline-block;margin-top:16px}
  .footer{text-align:center;font-size:.75rem;color:#aaa;margin-top:24px}
</style></head>
<body>
<div class='card'>
  <h2>Order Baru 🛎️</h2>
  <p class='sub'>Diterima pada ${new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date())} WIB</p>
  <div class='row'><span class='label'>Tamu</span><span class='val'>${escapeHtml(order.guest_name)}</span></div>
  <div class='row'><span class='label'>WhatsApp</span><span class='val'>${escapeHtml(order.guest_phone)}</span></div>
  <div class='row'><span class='label'>Meja</span><span class='val'>${escapeHtml(order.table_number || '—')}</span></div>
  ${order.notes ? `<div class='row'><span class='label'>Catatan</span><span class='val'>${escapeHtml(order.notes)}</span></div>` : ''}
  <hr class='divider' style='margin:8px 0'>
  ${itemRows}
  <hr class='divider' style='margin:4px 0'>
  <div class='total'><span>Total</span><span style='color:#C41230'>Rp ${formatNumber(order.total_amount)}</span></div>
  <div><span class='code'>${escapeHtml(order.order_code)}</span></div>
  <p class='footer'>Cotch Admin — <a href='${SITE_URL}/admin/bookings'>Lihat semua order</a></p>
</div>
</body></html>`
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function readSmtpLine(socket: net.Socket | tls.TLSSocket) {
  return new Promise<string>((resolve, reject) => {
    const onData = (chunk: Buffer | string) => {
      cleanup()
      resolve(chunk.toString())
    }
    const onError = (error: Error) => {
      cleanup()
      reject(error)
    }
    const cleanup = () => {
      socket.off('data', onData)
      socket.off('error', onError)
    }
    socket.once('data', onData)
    socket.once('error', onError)
  })
}

async function writeSmtp(socket: net.Socket | tls.TLSSocket, command: string) {
  await new Promise<void>((resolve, reject) => {
    socket.write(command, error => error ? reject(error) : resolve())
  })
}

async function expectSmtp(socket: net.Socket | tls.TLSSocket, allowedPrefixes: string[]) {
  const response = await readSmtpLine(socket)
  if (!allowedPrefixes.some(prefix => response.startsWith(prefix))) {
    throw new Error(`SMTP error: ${response.trim()}`)
  }
  return response
}

async function sendViaSmtp(to: string, subject: string, htmlBody: string) {
  const socket = net.createConnection({ host: MAIL_SMTP_HOST, port: MAIL_SMTP_PORT })
  socket.setEncoding('utf8')

  await expectSmtp(socket, ['220'])
  await writeSmtp(socket, `EHLO localhost\r\n`)
  let response = await expectSmtp(socket, ['250'])

  let transport: net.Socket | tls.TLSSocket = socket
  if (/STARTTLS/i.test(response)) {
    await writeSmtp(socket, 'STARTTLS\r\n')
    await expectSmtp(socket, ['220'])
    transport = tls.connect({
      socket,
      servername: MAIL_SMTP_HOST,
      rejectUnauthorized: false,
    })
    await new Promise<void>((resolve, reject) => {
      transport.once('secureConnect', () => resolve())
      transport.once('error', reject)
    })
    await writeSmtp(transport, `EHLO localhost\r\n`)
    response = await expectSmtp(transport, ['250'])
  }

  if (MAIL_SMTP_USER && MAIL_SMTP_PASS) {
    await writeSmtp(transport, 'AUTH LOGIN\r\n')
    await expectSmtp(transport, ['334'])
    await writeSmtp(transport, `${Buffer.from(MAIL_SMTP_USER).toString('base64')}\r\n`)
    await expectSmtp(transport, ['334'])
    await writeSmtp(transport, `${Buffer.from(MAIL_SMTP_PASS).toString('base64')}\r\n`)
    await expectSmtp(transport, ['235'])
  }

  const raw = [
    `From: ${MAIL_FROM_NAME} <${MAIL_FROM}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(htmlBody).toString('base64').replace(/(.{76})/g, '$1\r\n'),
  ].join('\r\n')

  await writeSmtp(transport, `MAIL FROM:<${MAIL_FROM}>\r\n`)
  await expectSmtp(transport, ['250'])
  await writeSmtp(transport, `RCPT TO:<${to}>\r\n`)
  await expectSmtp(transport, ['250', '251'])
  await writeSmtp(transport, 'DATA\r\n')
  await expectSmtp(transport, ['354'])
  await writeSmtp(transport, `${raw}\r\n.\r\n`)
  await expectSmtp(transport, ['250'])
  await writeSmtp(transport, 'QUIT\r\n')
  transport.end()
}

async function sendHtmlEmail(to: string, subject: string, htmlBody: string) {
  if (!to) return false

  const status = getMailConfigurationStatus()
  if (!status.enabled) {
    logMail(to, subject, 'skipped (SMTP config incomplete)')
    return false
  }

  try {
    await sendViaSmtp(to, subject, htmlBody)
    logMail(to, subject, 'sent via smtp')
    return true
  } catch (error) {
    console.error('[mail] send failed', error)
    logMail(to, subject, 'smtp failed')
    return false
  }
}

export async function sendOrderNotification(order: OrderNotificationPayload) {
  const subject = `Order Baru — ${order.guest_name} · ${order.order_code}`
  return sendHtmlEmail(ADMIN_EMAIL, subject, orderEmailHtml(order))
}
