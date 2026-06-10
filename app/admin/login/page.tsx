import Link from 'next/link'
import { redirect } from 'next/navigation'
import { loginAdminAction } from '@/app/admin/auth-actions'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import LegacyIcon from '@/components/ui/LegacyIcon'

type SearchParams = Promise<{ error?: string }>

export const metadata = {
  title: {
    absolute: 'Admin Login — Cotch',
  },
}

export default async function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  if (await isAdminAuthenticated()) {
    redirect('/admin')
  }

  const { error } = await searchParams

  return (
    <div className="admin-login">
      <div className="admin-login__box">
        <div className="admin-login__logo">Cotch</div>
        <div className="admin-login__sub">Admin Panel</div>

        {error ? (
          <div className="a-alert a-alert--error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LegacyIcon name="exclamation-triangle" size={18} />
            {error}
          </div>
        ) : null}

        <form action={loginAdminAction}>
          <div className="a-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="a-input"
              placeholder="Enter admin password"
              autoFocus
              required
            />
          </div>
          <button type="submit" className="a-btn a-btn--primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            Sign In →
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: '.75rem', color: '#9ca3af', textAlign: 'center' }}>
          <Link href="/" style={{ color: '#9ca3af' }}>← Back to site</Link>
        </p>
      </div>
    </div>
  )
}
