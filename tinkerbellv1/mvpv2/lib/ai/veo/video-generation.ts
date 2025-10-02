import { generateVideo } from './client'
import { logger } from '@/lib/utils/logger'
import type { VideoBrief } from '@/types/database'

/**
 * Generate video from brief
 */
export async function generateVideoFromBrief(
  brief: VideoBrief
): Promise<string> {
  logger.info('Generating video from brief', {
    prompt: brief.prompt.substring(0, 100),
    duration: brief.duration,
  })

  const result = await generateVideo({
    prompt: brief.prompt,
    duration: brief.duration,
    noAudio: brief.noAudio,
  })

  return result.video.url
}

/**
 * Generate multiple videos in sequence (not parallel due to resource intensity)
 */
export async function generateBulkVideos(
  briefs: Array<{ scriptId: string; brief: VideoBrief }>
): Promise<Array<{ scriptId: string; videoUrl: string }>> {
  logger.info('Generating bulk videos', { count: briefs.length })

  const results: Array<{ scriptId: string; videoUrl: string }> = []

  for (const { scriptId, brief } of briefs) {
    try {
      const videoUrl = await generateVideoFromBrief(brief)
      results.push({ scriptId, videoUrl })
      
      // Add delay between generations to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      logger.error('Failed to generate video', error, { scriptId })
      // Continue with next video
    }
  }

  return results
}
