import { generateStructuredOutput } from '../ai/gemini/structured-output'
import { createImageBriefPrompt, imageBriefSchema } from '../ai/prompts/image-brief-prompts'
import { createVideoBriefPrompt, videoBriefSchema } from '../ai/prompts/video-brief-prompts'
import { generateImagesFromBrief } from '../ai/imagen/image-generation'
import { generateVideoFromBrief } from '../ai/veo/video-generation'
import { createAsset, updateAsset, getAssetByScript } from '../supabase/database/assets'
import { getScript } from '../supabase/database/scripts'
import { uploadImageFromUrl, generateFilePath } from '../supabase/storage'
import { logger } from '@/lib/utils/logger'
import { DEFAULT_TEMPERATURES } from '@/lib/constants/temperatures'
import type { ImageBrief, VideoBrief } from '@/types/database'

/**
 * Generate image assets for a script
 */
export async function generateImageAssets(scriptId: string): Promise<string[]> {
  logger.info('Generating image assets', { scriptId })

  // Get script
  const script = await getScript(scriptId)
  if (!script) {
    throw new Error('Script not found')
  }

  // Generate image brief
  const briefResult = await generateStructuredOutput<ImageBrief>({
    prompt: createImageBriefPrompt(script),
    schema: imageBriefSchema,
    systemInstruction: 'You are an expert creative director.',
    temperature: DEFAULT_TEMPERATURES.brief_generation,
  })

  const imageBrief = briefResult.data

  // Generate images
  const imageUrls = await generateImagesFromBrief(imageBrief)

  // Upload to storage and get permanent URLs
  const permanentUrls: string[] = []
  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const path = generateFilePath('images', scriptId, `${i}.png`)
      const permanentUrl = await uploadImageFromUrl(imageUrls[i], path)
      permanentUrls.push(permanentUrl)
    } catch (error) {
      logger.error('Failed to upload image', error, { scriptId, index: i })
      // Use original URL as fallback
      permanentUrls.push(imageUrls[i])
    }
  }

  // Store in database
  const existingAsset = await getAssetByScript(scriptId)
  if (existingAsset) {
    await updateAsset(existingAsset.id, {
      image_brief: imageBrief,
      image_urls: permanentUrls,
    })
  } else {
    await createAsset({
      script_id: scriptId,
      image_brief: imageBrief,
      image_urls: permanentUrls,
    })
  }

  logger.info('Image assets generated', { scriptId, count: permanentUrls.length })

  return permanentUrls
}

/**
 * Generate video assets for a script
 */
export async function generateVideoAssets(scriptId: string): Promise<string[]> {
  logger.info('Generating video assets', { scriptId })

  // Get script
  const script = await getScript(scriptId)
  if (!script) {
    throw new Error('Script not found')
  }

  // Generate video brief
  const briefResult = await generateStructuredOutput<VideoBrief>({
    prompt: createVideoBriefPrompt(script),
    schema: videoBriefSchema,
    systemInstruction: 'You are an expert video creative director.',
    temperature: DEFAULT_TEMPERATURES.brief_generation,
  })

  const videoBrief = briefResult.data

  // Generate video
  const videoUrl = await generateVideoFromBrief(videoBrief)

  // Store in database
  const existingAsset = await getAssetByScript(scriptId)
  if (existingAsset) {
    await updateAsset(existingAsset.id, {
      video_brief: videoBrief,
      video_urls: [videoUrl],
    })
  } else {
    await createAsset({
      script_id: scriptId,
      video_brief: videoBrief,
      video_urls: [videoUrl],
    })
  }

  logger.info('Video assets generated', { scriptId })

  return [videoUrl]
}

/**
 * Generate image assets for multiple scripts
 */
export async function generateBulkImageAssets(scriptIds: string[]): Promise<void> {
  logger.info('Generating bulk image assets', { count: scriptIds.length })

  const results = await Promise.allSettled(
    scriptIds.map(id => generateImageAssets(id))
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  logger.info('Bulk image generation complete', { succeeded, failed })
}

/**
 * Generate video assets for multiple scripts (sequential to avoid overload)
 */
export async function generateBulkVideoAssets(scriptIds: string[]): Promise<void> {
  logger.info('Generating bulk video assets', { count: scriptIds.length })

  let succeeded = 0
  let failed = 0

  for (const scriptId of scriptIds) {
    try {
      await generateVideoAssets(scriptId)
      succeeded++
      
      // Delay between videos to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 5000))
    } catch (error) {
      logger.error('Failed to generate video', error, { scriptId })
      failed++
    }
  }

  logger.info('Bulk video generation complete', { succeeded, failed })
}
