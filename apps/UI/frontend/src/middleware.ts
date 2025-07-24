import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  /**
   * Apply Middleware below to all routes
   *
   *  You can add custom headers, modify the request or response,
   * or perform any other operations before the request is processed.
   * *  For example, you can add a custom header to the response:
   * response.headers.set('X-Custom-Header', 'MyValue')
   * * You can also modify the request object if needed:
   * request.headers.set('X-Request-Header', 'MyValue')
   * * You can also perform operations like logging, authentication, etc.
   * * Note: Be cautious with performance and security implications when modifying requests or responses.
   */

  // Add caching headers for static assets
  if (request.nextUrl.pathname.startsWith('/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
}
