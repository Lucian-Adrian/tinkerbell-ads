import { NextResponse } from 'next/server'

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Tinkerbell MVP v2',
    version: '0.1.0',
  })
}
