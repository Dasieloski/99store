import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')

  // Proteger rutas de admin, excluyendo /admin/auth/login
  if (
    request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/auth/login')
  ) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/auth/login', request.url))
    }

    // Aquí podrías verificar la validez del token sin usar Prisma,
    // por ejemplo, utilizando una función signada previamente.

    return NextResponse.next()
  }

  // Otras rutas
  if (session) {
    // Similarmente, maneja la actualización de sesión sin Prisma
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|admin/auth/login).*)',
  ],
}

