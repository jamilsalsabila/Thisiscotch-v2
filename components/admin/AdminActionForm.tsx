'use client'

type AdminActionFormProps = {
  action: (formData: FormData) => void | Promise<void>
  children: React.ReactNode
  className?: string
  confirmMessage?: string
  style?: React.CSSProperties
}

export default function AdminActionForm({
  action,
  children,
  className,
  confirmMessage,
  style,
}: AdminActionFormProps) {
  return (
    <form
      action={action}
      className={className}
      style={style}
      onSubmit={event => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault()
        }
      }}
    >
      {children}
    </form>
  )
}
