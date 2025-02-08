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


   // Check if the user is accessing employee routes
  if (request.nextUrl.pathname.startsWith("/empleado")) {
    // Skip middleware for login page
    if (request.nextUrl.pathname === "/empleado/login") {
      return NextResponse.next()
    }

    // Check for authentication (replace with your actual auth check)
    const isAuthenticated = request.cookies.has("employee_session")

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/empleado/login", request.url))
    }
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
    //'/((?!api|_next/static|_next/image|favicon.ico|empleado/login).*)',
    "/empleado/:path*"
    
    
  ],
}

