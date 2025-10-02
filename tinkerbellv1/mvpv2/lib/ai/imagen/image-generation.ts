import { generateImages } from './client'
import { logger } from '@/lib/utils/logger'
import type { ImageBrief } from '@/types/database'

/**
 * Generate images from brief
 */
export async function generateImagesFromBrief(
  brief: ImageBrief
): Promise<string[]> {
  logger.info('Generating images from brief', {
    prompt: brief.prompt.substring(0, 100),
    numberOfImages: brief.numberOfImages,
  })

  const result = await generateImages({
    prompt: brief.prompt,
    numberOfImages: brief.numberOfImages,
    aspectRatio: brief.aspectRatio as any,
  })

  return result.images.map(img => img.url)
}

/**
 * Generate multiple image sets in parallel
 */
export async function generateBulkImages(
  briefs: Array<{ scriptId: string; brief: ImageBrief }>
): Promise<Array<{ scriptId: string; imageUrls: string[] }>> {
  logger.info('Generating bulk images', { count: briefs.length })

  const results = await Promise.allSettled(
    briefs.map(async ({ scriptId, brief }) => {
      const imageUrls = await generateImagesFromBrief(brief)
      return { scriptId, imageUrls }
    })
  )

  return results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .map(r => r.value)
}
