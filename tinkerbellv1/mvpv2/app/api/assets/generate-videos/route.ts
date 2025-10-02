import { NextRequest, NextResponse } from 'next/server'
import { generateBulkVideoAssets } from '@/lib/services/asset-service'
import { validate, generateVideosRequestSchema } from '@/lib/utils/validation'
import { handleError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

/**
 * POST /api/assets/generate-videos
 * Generate videos for top 3 scripts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scriptIds } = validate(generateVideosRequestSchema, body)

    logger.info('Generating videos', { count: scriptIds.length })

    // Generate videos
    await generateBulkVideoAssets(scriptIds)

    return NextResponse.json({
      message: `Video generation started for ${scriptIds.length} scripts`,
      scriptIds,
    })
  } catch (error) {
    logger.error('Generate videos error', error)
    const errorResponse = handleError(error)
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    )
  }
}
