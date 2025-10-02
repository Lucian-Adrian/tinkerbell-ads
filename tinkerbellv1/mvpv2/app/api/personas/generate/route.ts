import { NextRequest, NextResponse } from 'next/server'
import { getCompany } from '@/lib/supabase/database/companies'
import { createJob } from '@/lib/supabase/database/jobs'
import { generatePersonasForCompany } from '@/lib/services/persona-service'
import { handleError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

/**
 * POST /api/personas/generate
 * Generate personas for a company
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyId } = body

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      )
    }

    logger.info('Generating personas', { companyId })

    // Get company
    const company = await getCompany(companyId)
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Generate personas
    const personas = await generatePersonasForCompany(
      companyId,
      company.url,
      company.uvp,
      company.metadata || {}
    )

    logger.info('Personas generated', {
      companyId,
      count: personas.length,
    })

    return NextResponse.json({
      personas: personas.map(p => ({
        id: p.id,
        name: p.name,
        persona: p.data,
      })),
      message: 'Personas generated successfully',
    })
  } catch (error) {
    logger.error('Generate personas error', error)
    const errorResponse = handleError(error)
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    )
  }
}
