import { getGeminiModel } from './client'
import { logger } from '@/lib/utils/logger'
import { retryWithBackoff } from '@/lib/utils/retry'
import type { GeminiStructuredRequest, GeminiStructuredResponse } from '@/types/ai'

/**
 * Generate structured JSON output using Gemini
 */
export async function generateStructuredOutput<T = any>(
  request: GeminiStructuredRequest<T>
): Promise<GeminiStructuredResponse<T>> {
  return retryWithBackoff(async () => {
    const model = getGeminiModel()

    const generationConfig: any = {
      temperature: request.temperature ?? 0.5,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
      thinkingConfig: {
        thinkingBudget: 0, // Disable thinking for speed
      },
    }

    // Add schema if provided
    if (request.schema) {
      generationConfig.responseSchema = request.schema
    }

    const parts = []
    if (request.systemInstruction) {
      parts.push({ text: `System: ${request.systemInstruction}\n\n` })
    }
    
    // Add explicit JSON instruction
    parts.push({
      text: `${request.prompt}\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanations.`,
    })

    logger.debug('Generating structured output with Gemini', {
      promptLength: request.prompt.length,
      hasSchema: !!request.schema,
    })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig,
    })

    const response = result.response
    let text = response.text()

    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    logger.debug('Raw response', { text: text.substring(0, 200) })

    // Parse JSON
    let data: T
    try {
      data = JSON.parse(text)
    } catch (error) {
      logger.error('Failed to parse JSON response', error, { text })
      throw new Error(`Invalid JSON response from AI: ${text.substring(0, 100)}...`)
    }

    return {
      data,
      text,
    }
  })
}

/**
 * Helper to generate structured output with type safety
 */
export async function generateTypedOutput<T>(
  prompt: string,
  schema: any,
  options?: {
    systemInstruction?: string
    temperature?: number
  }
): Promise<T> {
  const result = await generateStructuredOutput<T>({
    prompt,
    schema,
    systemInstruction: options?.systemInstruction,
    temperature: options?.temperature,
  })

  return result.data
}
