// middleware.ts
import { NextResponse, NextRequest } from 'next/server'

export const config = {
  // run on all pages or narrow this
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

export default async function dvcMiddleware(req: NextRequest) {
  const res = NextResponse.next()
  let id = req.cookies.get('dvc_id')?.value

  if (!id) {
    id = crypto.randomUUID()
    // httpOnly false so client SDK can also read it if needed; flip to true if you only use server
    res.cookies.set('dvc_id', id, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
      secure: true,
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
  }

  // (Optional) If you must route early based on a flag, call a tiny edge route.
  // See step 6. Example:
  // const r = await fetch(new URL('/api/dvc-flag?key=enableNewHome', req.url), {
  //   headers: { 'x-dvc-id': id! },
  // })
  // const { value } = await r.json()
  // if (value) return NextResponse.rewrite(new URL('/new-home', req.url))

  return res
}
