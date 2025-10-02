/**
 * Imagen Prompt Builder
 * Constructs optimized prompts for image generation
 */

export interface ImagePromptOptions {
  style?: string
  mood?: string
  lighting?: string
  composition?: string
  quality?: string
}

/**
 * Build an optimized prompt for Imagen
 */
export function buildImagePrompt(
  basePrompt: string,
  options: ImagePromptOptions = {}
): string {
  const parts = [basePrompt]

  // Add style
  if (options.style) {
    parts.push(`Style: ${options.style}`)
  }

  // Add mood
  if (options.mood) {
    parts.push(`Mood: ${options.mood}`)
  }

  // Add lighting
  if (options.lighting) {
    parts.push(`Lighting: ${options.lighting}`)
  }

  // Add composition
  if (options.composition) {
    parts.push(`Composition: ${options.composition}`)
  }

  // Add quality descriptors
  if (options.quality !== 'none') {
    const quality = options.quality || 'high quality, professional, detailed, sharp focus'
    parts.push(quality)
  }

  return parts.join(', ')
}

/**
 * Common style presets
 */
export const IMAGE_STYLES = {
  photorealistic: 'photorealistic, professional photography, high resolution',
  illustration: 'digital illustration, vibrant colors, modern design',
  minimalist: 'minimalist design, clean, simple, elegant',
  corporate: 'professional, corporate, business-appropriate',
  creative: 'creative, artistic, unique perspective',
  modern: 'modern, contemporary, sleek design',
} as const

/**
 * Build marketing image prompt
 */
export function buildMarketingImagePrompt(
  headline: string,
  description: string,
  style: keyof typeof IMAGE_STYLES = 'modern'
): string {
  return buildImagePrompt(
    `Marketing image for: ${headline}. ${description}`,
    {
      style: IMAGE_STYLES[style],
      quality: 'high quality, attention-grabbing, professional',
      composition: 'well-balanced, visually striking',
    }
  )
}
