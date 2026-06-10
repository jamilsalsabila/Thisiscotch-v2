import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const ADMIN_COOKIE = 'cotch_admin'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const isLoginPage = pathname === '/admin/login'
  const hasAdminCookie = Boolean(request.cookies.get(ADMIN_COOKIE)?.value)

  if (!hasAdminCookie && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (hasAdminCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
