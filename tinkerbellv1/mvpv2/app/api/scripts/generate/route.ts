import { NextRequest, NextResponse } from 'next/server'
import { createJob } from '@/lib/supabase/database/jobs'
import { generateScriptsForPersona } from '@/lib/services/script-service'
import { validate, generateScriptsRequestSchema } from '@/lib/utils/validation'
import { handleError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

/**
 * POST /api/scripts/generate
 * Generate scripts for a persona
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { personaId, batches } = validate(generateScriptsRequestSchema, body)

    logger.info('Generating scripts', { personaId, batches })

    // Generate scripts
    const result = await generateScriptsForPersona(personaId, batches)

    logger.info('Scripts generated', {
      personaId,
      totalScripts: result.totalScripts,
      batchCount: result.batchIds.length,
    })

    return NextResponse.json({
      batchIds: result.batchIds,
      totalScripts: result.totalScripts,
      message: `Generated ${result.totalScripts} scripts across ${result.batchIds.length} batches`,
    })
  } catch (error) {
    logger.error('Generate scripts error', error)
    const errorResponse = handleError(error)
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    )
  }
}
