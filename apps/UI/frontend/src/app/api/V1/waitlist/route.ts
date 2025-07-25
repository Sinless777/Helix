// src/app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyeTuAyrIS7RBSw4ksZASPCNBd4cgzysYfQDw_999ForOy9lE3Sx_oI5gm5gDJKgfCg/exec'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    // If HTTP-level success, assume sheet append worked
    if (res.ok) {
      return NextResponse.json({ status: 'success' }, { status: 200 })
    }

    // Otherwise bubble up the error text
    const text = await res.text()
    return NextResponse.json(
      { status: 'error', message: `Sheets API error ${res.status}: ${text}` },
      { status: 502 }
    )
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown proxy error'
    return NextResponse.json(
      { status: 'error', message },
      { status: 500 }
    )
  }
}
