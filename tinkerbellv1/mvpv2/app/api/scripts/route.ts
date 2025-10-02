import { NextRequest, NextResponse } from 'next/server'
import { getScriptsByPersona } from '@/lib/supabase/database/scripts'
import { handleError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

/**
 * GET /api/scripts?personaId=xxx
 * List scripts for a persona
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const personaId = searchParams.get('personaId')

    if (!personaId) {
      return NextResponse.json(
        { error: 'personaId is required' },
        { status: 400 }
      )
    }

    const scripts = await getScriptsByPersona(personaId)

    return NextResponse.json({
      scripts: scripts.map(s => ({
        id: s.id,
        headline: s.headline,
        body: s.body,
        cta: s.cta,
        keywords: s.keywords,
        idea: s.idea_json,
        createdAt: s.created_at,
      })),
    })
  } catch (error) {
    logger.error('List scripts error', error)
    const errorResponse = handleError(error)
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    )
  }
}
