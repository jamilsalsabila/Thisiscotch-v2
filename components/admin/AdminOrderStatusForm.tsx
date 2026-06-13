'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { updateOrderStatus } from '@/app/admin/actions'

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'cancelled'] as const

export default function AdminOrderStatusForm({
  orderId,
  defaultValue,
}: {
  orderId: number
  defaultValue: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <form className="admin-order-status-form">
      <select
        name="status"
        className="a-select"
        style={{ padding: '4px 8px', fontSize: '.75rem' }}
        defaultValue={defaultValue}
        disabled={isPending}
        onChange={event => {
          const nextStatus = event.currentTarget.value

          startTransition(async () => {
            await updateOrderStatus(orderId, nextStatus)
            router.replace('/admin/bookings?tab=orders&msg=Status+order+diperbarui.')
            router.refresh()
          })
        }}
      >
        {ORDER_STATUSES.map(status => (
          <option key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </option>
        ))}
      </select>
    </form>
  )
}
