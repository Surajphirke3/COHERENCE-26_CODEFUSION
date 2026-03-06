import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/projects/:path*',
    '/docs/:path*',
    '/team/:path*',
    '/ai/:path*',
    '/settings/:path*',
    '/outreach/:path*',
    '/api/projects/:path*',
    '/api/tasks/:path*',
    '/api/docs/:path*',
    '/api/team/:path*',
    '/api/activity/:path*',
    '/api/ai/:path*',
    '/api/leads/:path*',
    '/api/workflows/:path*',
    '/api/outreach/:path*',
  ],
}
