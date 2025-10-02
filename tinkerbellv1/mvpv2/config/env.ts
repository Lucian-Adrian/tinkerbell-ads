/**
 * Environment Configuration
 */

export const env = {
  // App
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  // Google AI
  googleAi: {
    apiKey: process.env.GOOGLE_AI_API_KEY!,
    geminiModel: process.env.GOOGLE_GEMINI_MODEL || 'gemini-2.5-flash',
    imagenModel: process.env.GOOGLE_IMAGEN_MODEL || 'imagen-4.0-fast-generate-001',
    veoModel: process.env.GOOGLE_VEO_MODEL || 'veo-3-fast',
  },
} as const

/**
 * Validate required environment variables
 */
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_AI_API_KEY',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Validate on import (server-side only)
if (typeof window === 'undefined') {
  try {
    validateEnv()
  } catch (error) {
    console.error('Environment validation failed:', error)
  }
}
