import { NextRequest, NextResponse } from 'next/server'
import { getPersonasByCompany } from '@/lib/supabase/database/personas'
import { handleError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

/**
 * GET /api/personas?companyId=xxx
 * List personas for a company
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      )
    }

    const personas = await getPersonasByCompany(companyId)

    return NextResponse.json({
      personas: personas.map(p => ({
        id: p.id,
        name: p.name,
        persona: p.persona_json,
        createdAt: p.created_at,
      })),
    })
  } catch (error) {
    logger.error('List personas error', error)
    const errorResponse = handleError(error)
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    )
  }
}
