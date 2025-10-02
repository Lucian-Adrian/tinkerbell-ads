import { NextRequest, NextResponse } from 'next/server'
import { generateBulkImageAssets } from '@/lib/services/asset-service'
import { validate, generateImagesRequestSchema } from '@/lib/utils/validation'
import { handleError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

/**
 * POST /api/assets/generate-images
 * Generate images for top scripts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scriptIds } = validate(generateImagesRequestSchema, body)

    logger.info('Generating images', { count: scriptIds.length })

    // Generate images
    await generateBulkImageAssets(scriptIds)

    return NextResponse.json({
      message: `Image generation started for ${scriptIds.length} scripts`,
      scriptIds,
    })
  } catch (error) {
    logger.error('Generate images error', error)
    const errorResponse = handleError(error)
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    )
  }
}
