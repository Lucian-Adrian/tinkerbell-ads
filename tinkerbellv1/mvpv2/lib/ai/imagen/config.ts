/**
 * Imagen 4 Fast Configuration
 */

export const IMAGEN_CONFIG = {
  model: 'imagen-4.0-fast-generate-001',
  
  defaultSettings: {
    numberOfImages: 4,
    aspectRatio: '16:9' as const,
    personGeneration: 'allow_adult' as const,
  },

  aspectRatios: {
    square: '1:1',
    portrait: '3:4',
    landscape: '4:3',
    verticalVideo: '9:16',
    horizontalVideo: '16:9',
  },

  limits: {
    maxPromptLength: 480, // tokens
    maxImagesPerRequest: 4,
  },
} as const

export default IMAGEN_CONFIG
