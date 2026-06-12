import { requireAdminAccess } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { saveSchedule } from '@/app/admin/actions'
import { getSiteData } from '@/lib/site'
import LegacyIcon from '@/components/ui/LegacyIcon'

function parseSchedule(value: string | undefined) {
  if (!value) return {} as Record<string, { is_open: boolean; open: string; close: string }>
  try {
    return JSON.parse(value) as Record<string, { is_open: boolean; open: string; close: string }>
  } catch {
    return {} as Record<string, { is_open: boolean; open: string; close: string }>
  }
}

export default async function AdminSchedulePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAdminAccess()
  const supabase = createAdminClient()
  const site = await getSiteData()
  const params = await searchParams
  const isSaved = params?.saved === '1'
  const { data } = await (supabase.from('site_settings').select('key, value').in('key', ['daily_schedule', 'days_text', 'days_text_id']) as any)
  const map = new Map((((data as Array<{ key: string; value: string }> | null) ?? []).map(item => [item.key, item.value])))
  const rawSchedule = map.get('daily_schedule')
  const schedule = parseSchedule(rawSchedule)
  const weekdayMap: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }
  const todayShort = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', weekday: 'short' }).format(new Date())
  const todayIso = weekdayMap[todayShort] ?? 1
  const nowLabel = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'long',
  }).format(new Date())

  const days = [
    { id: 1, label: 'Monday' },
    { id: 2, label: 'Tuesday' },
    { id: 3, label: 'Wednesday' },
    { id: 4, label: 'Thursday' },
    { id: 5, label: 'Friday' },
    { id: 6, label: 'Saturday' },
    { id: 7, label: 'Sunday' },
  ]

  return (
    <form action={saveSchedule}>
      {isSaved ? (
        <div className="a-card" style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#166534' }}>
          <strong>Schedule updated.</strong> The latest opening-hours settings are now saved.
        </div>
      ) : null}
      <div className="a-card">
        <h2>Per-Day Hours</h2>
        <p style={{ fontSize: '.85rem', color: 'var(--a-muted)', marginBottom: 20 }}>
          Toggle each day open or closed, then set its opening and closing time. Changes take effect immediately.
        </p>

        <div className="a-table-wrap">
          <table className="day-schedule-table">
            <thead>
              <tr>
                <th style={{ width: 180 }}>Day</th>
                <th style={{ width: 80 }}>Open?</th>
                <th>Opening Time</th>
                <th>Closing Time</th>
                <th style={{ width: 120 }}>Preview</th>
              </tr>
            </thead>
            <tbody>
              {days.map(day => {
                const item = schedule[String(day.id)] ?? { is_open: true, open: '12:00', close: '21:00' }
                const isToday = day.id === todayIso
                return (
                  <tr key={day.id} className={`${isToday ? 'today ' : ''}${item.is_open ? '' : 'day-closed'}`.trim()}>
                    <td>
                      <div className="day-name-cell">
                        <span className={`day-dot ${item.is_open ? 'open' : 'closed'}`} />
                        <span style={{ fontWeight: 500 }}>{day.label}</span>
                        {isToday ? <span className="today-tag">TODAY</span> : null}
                      </div>
                    </td>
                    <td>
                      <label className="a-toggle">
                        <input type="checkbox" name={`day_open_${day.id}`} defaultChecked={item.is_open} />
                        <span className="a-toggle__slider" />
                      </label>
                    </td>
                    <td><input className="a-input" type="time" name={`open_${day.id}`} defaultValue={item.open} /></td>
                    <td><input className="a-input" type="time" name={`close_${day.id}`} defaultValue={item.close} /></td>
                    <td>
                      <span className={`a-badge ${item.is_open ? 'a-badge--green' : 'a-badge--red'}`}>
                        {item.is_open ? `${item.open} – ${item.close}` : 'Closed'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="a-card">
        <h2>Display Labels</h2>
        <p style={{ fontSize: '.85rem', color: 'var(--a-muted)', marginBottom: 16 }}>
          Short text shown in the footer and hero section of the public site.
        </p>
        <div className="a-grid-2">
          <div className="a-form-group">
            <label>Days Text (English)</label>
            <input className="a-input" name="days_text" defaultValue={map.get('days_text') ?? 'Mon – Sun'} />
          </div>
          <div className="a-form-group">
            <label>Days Text (Indonesian)</label>
            <input className="a-input" name="days_text_id" defaultValue={map.get('days_text_id') ?? 'Sen – Min'} />
          </div>
        </div>
      </div>

      <button className="a-btn a-btn--primary" type="submit" style={{ fontSize: '1rem', padding: '12px 28px' }}>
        Save Schedule
      </button>

      <div className="a-card" style={{ marginTop: 24 }}>
        <h2>Live Status</h2>
        <div className="admin-schedule-status" style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '.9rem' }}>
          <div>
            <strong>Today ({days.find(day => day.id === todayIso)?.label}):</strong>{' '}
            {schedule[String(todayIso)]?.is_open === false ? <em>Closed today</em> : `Open ${(schedule[String(todayIso)]?.open ?? '12:00')} – ${(schedule[String(todayIso)]?.close ?? '21:00')} WIB`}
          </div>
          <div className="admin-schedule-status-row" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <LegacyIcon name="clock" size={16} />
            <strong>Server time:</strong> {nowLabel} WIB
          </div>
          <div className="admin-schedule-status-row" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <strong>Status right now:</strong>
            <span className={`a-badge ${site.isOpen ? 'a-badge--green' : 'a-badge--red'}`}>
              {site.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
      </div>
    </form>
  )
}
