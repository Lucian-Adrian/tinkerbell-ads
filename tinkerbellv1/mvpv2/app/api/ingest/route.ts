import { NextRequest, NextResponse } from 'next/server'
import { createCompany } from '@/lib/supabase/database/companies'
import { createJob } from '@/lib/supabase/database/jobs'
import { scrapeCompanyWebsite } from '@/lib/services/ingestion-service'
import { validate, ingestRequestSchema } from '@/lib/utils/validation'
import { handleError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

/**
 * POST /api/ingest
 * Ingest a company URL and UVP, scrape website, and queue persona generation
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { url, uvp } = validate(ingestRequestSchema, body)

    logger.info('Ingesting company', { url })

    // TODO: Get user ID from auth session
    // For now, using a placeholder
    const userId = '00000000-0000-0000-0000-000000000000'

    // Scrape website
    const metadata = await scrapeCompanyWebsite(url)

    // Create company record
    const company = await createCompany({
      user_id: userId,
      url,
      uvp,
      metadata,
    })

    // Create job for persona generation
    const job = await createJob({
      type: 'generate_personas',
      payload: {
        companyId: company.id,
      },
    })

    logger.info('Company ingested successfully', {
      companyId: company.id,
      jobId: job.id,
    })

    return NextResponse.json({
      companyId: company.id,
      jobId: job.id,
      message: 'Company ingested successfully. Persona generation queued.',
    })
  } catch (error) {
    logger.error('Ingest error', error)
    const errorResponse = handleError(error)
    return NextResponse.json(
      { error: errorResponse.message, details: errorResponse },
      { status: errorResponse.statusCode }
    )
  }
}
