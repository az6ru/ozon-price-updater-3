import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/login" || path === "/register" || path.startsWith("/api/")

  // Get the token from the cookies
  const token = request.cookies.get("auth_token")?.value

  // If the path is not public and there's no token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If the path is login or register and there's a token, redirect to dashboard
  // Only do this for actual page navigations, not for API calls
  if ((path === "/login" || path === "/register") && token && !request.headers.get("x-middleware-prefetch")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next (static files)
     * 2. /favicon.ico, /sitemap.xml (static files)
     */
    "/((?!_next|favicon.ico|sitemap.xml).*)",
  ],
}

