'use client'

import { useState } from 'react'

type ScheduleItem = {
  is_open: boolean
  open: string
  close: string
}

type Day = {
  id: number
  label: string
}

type Props = {
  days: Day[]
  initialSchedule: Record<string, ScheduleItem>
  todayIso: number
}

const DEFAULT_ITEM: ScheduleItem = {
  is_open: true,
  open: '12:00',
  close: '21:00',
}

export default function AdminScheduleTable({ days, initialSchedule, todayIso }: Props) {
  const [schedule, setSchedule] = useState<Record<string, ScheduleItem>>(() => {
    const next: Record<string, ScheduleItem> = {}

    for (const day of days) {
      next[String(day.id)] = initialSchedule[String(day.id)] ?? DEFAULT_ITEM
    }

    return next
  })

  function updateDay(dayId: number, patch: Partial<ScheduleItem>) {
    setSchedule(current => ({
      ...current,
      [String(dayId)]: {
        ...(current[String(dayId)] ?? DEFAULT_ITEM),
        ...patch,
      },
    }))
  }

  return (
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
            const item = schedule[String(day.id)] ?? DEFAULT_ITEM
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
                    <input
                      type="checkbox"
                      name={`day_open_${day.id}`}
                      checked={item.is_open}
                      onChange={event => updateDay(day.id, { is_open: event.target.checked })}
                    />
                    <span className="a-toggle__slider" />
                  </label>
                </td>
                <td>
                  <input
                    className="a-input"
                    type="time"
                    name={`open_${day.id}`}
                    value={item.open}
                    onChange={event => updateDay(day.id, { open: event.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="a-input"
                    type="time"
                    name={`close_${day.id}`}
                    value={item.close}
                    onChange={event => updateDay(day.id, { close: event.target.value })}
                  />
                </td>
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
  )
}
