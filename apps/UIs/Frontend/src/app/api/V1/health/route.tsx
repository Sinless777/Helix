// Health check endpoint for V1 API
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // You can add any health check logic here, such as checking database connectivity, etc.

  const message = {
    status: 'ok',
    message: {
      text: 'API is healthy',
    },
    timestamp: new Date().toISOString(),
    version: process.env.VERSION || 'unknown',
    env: process.env.NODE_ENV || 'development',
  }

  return NextResponse.json(message)
}
