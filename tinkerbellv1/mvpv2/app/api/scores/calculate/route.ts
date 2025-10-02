import { NextRequest, NextResponse } from 'next/server'
import { calculateBulkScores } from '@/lib/services/scoring-service'
import { validate, calculateScoresRequestSchema } from '@/lib/utils/validation'
import { handleError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

/**
 * POST /api/scores/calculate
 * Calculate ViralCheck scores for scripts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scriptId, scriptIds } = validate(calculateScoresRequestSchema, body)

    const idsToScore = scriptId ? [scriptId] : scriptIds || []

    if (idsToScore.length === 0) {
      return NextResponse.json(
        { error: 'Either scriptId or scriptIds must be provided' },
        { status: 400 }
      )
    }

    logger.info('Calculating scores', { count: idsToScore.length })

    // Calculate scores
    await calculateBulkScores(idsToScore)

    return NextResponse.json({
      message: `Scores calculated for ${idsToScore.length} scripts`,
      scriptIds: idsToScore,
    })
  } catch (error) {
    logger.error('Calculate scores error', error)
    const errorResponse = handleError(error)
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    )
  }
}
