import { NextRequest, NextResponse } from 'next/server'
import { getJob } from '@/lib/supabase/database/jobs'
import { handleError } from '@/lib/utils/error-handler'

/**
 * GET /api/jobs/[id]
 * Get job status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await getJob(params.id)

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: job.id,
      type: job.type,
      status: job.status,
      payload: job.payload,
      result: job.result,
      error: job.error,
      createdAt: job.created_at,
      completedAt: job.completed_at,
    })
  } catch (error) {
    const errorResponse = handleError(error)
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    )
  }
}
