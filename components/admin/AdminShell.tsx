'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { logoutAdminAction } from '@/app/admin/auth-actions'
import LegacyIcon from '@/components/ui/LegacyIcon'

const NAV_ITEMS = [
  { href: '/admin', slug: 'index', label: 'Dashboard', icon: 'home' as const },
  { href: '/admin/menu', slug: 'menu', label: 'Menu', icon: 'squares-2x2' as const },
  { href: '/admin/categories', slug: 'categories', label: 'Categories', icon: 'tag' as const },
  { href: '/admin/schedule', slug: 'schedule', label: 'Schedule', icon: 'clock' as const },
  { href: '/admin/gallery', slug: 'gallery', label: 'Gallery', icon: 'photo' as const },
  { href: '/admin/settings', slug: 'settings', label: 'Settings', icon: 'cog' as const },
  { href: '/admin/bookings', slug: 'bookings', label: 'Bookings', icon: 'clipboard-list' as const },
]

function pageTitle(pathname: string) {
  if (pathname === '/admin') return 'Dashboard'
  if (pathname.startsWith('/admin/bookings')) return 'Bookings, Orders & Waitlist'
  if (pathname.startsWith('/admin/menu')) return 'Menu Management'
  if (pathname.startsWith('/admin/categories')) return 'Categories & Subcategories'
  if (pathname.startsWith('/admin/schedule')) return 'Operating Schedule'
  if (pathname.startsWith('/admin/gallery')) return 'Gallery'
  if (pathname.startsWith('/admin/settings')) return 'General Settings'
  if (pathname.startsWith('/admin/reviews')) return 'Customer Reviews'
  return 'Admin'
}

export default function AdminShell({
  unseenBookings,
  isOpen,
  children,
}: {
  unseenBookings: number
  isOpen: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="admin-wrap">
      <div className={`admin-sidebar-overlay${sidebarOpen ? ' visible' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`} id="adminSidebar">
        <div className="admin-sidebar__logo">
          <img src="/assets/images/cotch-logo.png" alt="Cotch" style={{ height: 38, width: 'auto', display: 'block', marginBottom: 6 }} />
          <div className="sub">Admin Panel</div>
        </div>

        <nav className="admin-nav">
          <div className="nav-section">Navigation</div>
          {NAV_ITEMS.map(item => {
            const active = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'active' : ''}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => setSidebarOpen(false)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="icon"><LegacyIcon name={item.icon} size={18} /></span>
                  {item.label}
                </span>
              </Link>
            )
          })}

          <div className="nav-section" style={{ marginTop: 12 }}>Site</div>
          <a href="/" target="_blank" rel="noreferrer">
            <span className="icon"><LegacyIcon name="globe" size={18} /></span>
            View Website
          </a>
        </nav>

        <div className="admin-sidebar__bottom" style={{ paddingBottom: 20 }}>
          Logged in as <strong>admin</strong><br />
          <form action={logoutAdminAction} style={{ marginTop: 4 }}>
            <button
              type="submit"
              style={{ padding: 0, border: 0, background: 'transparent', color: 'rgba(255,255,255,.5)', cursor: 'pointer', font: 'inherit' }}
            >
              Logout
            </button>
          </form>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <button className="admin-mob-toggle" onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <span />
            <span />
            <span />
          </button>
          <div className="admin-topbar__title">{pageTitle(pathname)}</div>
          <div className="admin-topbar__right">
            <span
              className={`status-dot ${isOpen ? 'status-dot--open' : 'status-dot--closed'}`}
              title={isOpen ? 'Cafe is open' : 'Cafe is closed'}
            />
            <a href="/" target="_blank" rel="noreferrer" className="a-btn a-btn--outline a-btn--sm">View Site ↗</a>
            <form action={logoutAdminAction}>
              <button type="submit" className="a-btn a-btn--outline a-btn--sm">Logout</button>
            </form>
          </div>
        </div>

        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}
