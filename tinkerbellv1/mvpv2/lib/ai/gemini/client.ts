import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '@/config/env'

/**
 * Gemini AI Client
 */
export const genAI = new GoogleGenerativeAI(env.googleAi.apiKey)

/**
 * Get Gemini model instance
 */
export function getGeminiModel(modelName?: string) {
  return genAI.getGenerativeModel({
    model: modelName || env.googleAi.geminiModel,
  })
}

export default genAI
