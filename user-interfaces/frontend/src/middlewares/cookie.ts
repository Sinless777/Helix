import { type NextRequest, NextResponse } from 'next/server'
import { getStableId } from '../lib/get-stable-id'

export const config = {
  matcher: ['/', '/cart'],
}

export async function cookieMiddleware(request: NextRequest) {
  const stableId = await getStableId()



  if (stableId.isFresh) {
    request.headers.set('x-generated-stable-id', stableId.value)
  }

  // response headers
  const headers = new Headers()
  headers.append('set-cookie', `stable-id=${stableId.value}`)
  return NextResponse.rewrite(request.nextUrl, { request, headers })
}