/**
 * Veo 3 Fast Configuration
 */

export const VEO_CONFIG = {
  model: 'veo-3-fast',
  
  defaultSettings: {
    duration: 6, // seconds
    noAudio: true,
  },

  limits: {
    maxPromptLength: 500, // characters
    minDuration: 2,
    maxDuration: 10,
  },
} as const

export default VEO_CONFIG
