import { getGeminiModel } from './client'
import { logger } from '@/lib/utils/logger'
import { retryWithBackoff } from '@/lib/utils/retry'
import type { GeminiTextRequest, GeminiTextResponse } from '@/types/ai'

/**
 * Generate text using Gemini
 */
export async function generateText(
  request: GeminiTextRequest
): Promise<GeminiTextResponse> {
  return retryWithBackoff(async () => {
    const model = getGeminiModel()

    const generationConfig: any = {
      temperature: request.temperature ?? 0.5,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: request.maxTokens ?? 8192,
    }

    // Disable thinking for speed
    if (request.thinkingBudget !== undefined) {
      generationConfig.thinkingConfig = {
        thinkingBudget: request.thinkingBudget,
      }
    } else {
      generationConfig.thinkingConfig = {
        thinkingBudget: 0, // Disable thinking by default
      }
    }

    const parts = []
    if (request.systemInstruction) {
      parts.push({ text: `System: ${request.systemInstruction}\n\n` })
    }
    parts.push({ text: request.prompt })

    logger.debug('Generating text with Gemini', {
      promptLength: request.prompt.length,
      temperature: generationConfig.temperature,
    })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig,
    })

    const response = result.response
    const text = response.text()

    logger.debug('Generated text', {
      responseLength: text.length,
    })

    return {
      text,
      usage: {
        promptTokens: 0, // Not available in this API version
        completionTokens: 0,
        totalTokens: 0,
      },
    }
  })
}

/**
 * Generate text with streaming
 */
export async function* generateTextStream(
  request: GeminiTextRequest
): AsyncGenerator<string> {
  const model = getGeminiModel()

  const generationConfig: any = {
    temperature: request.temperature ?? 0.5,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: request.maxTokens ?? 8192,
    thinkingConfig: {
      thinkingBudget: request.thinkingBudget ?? 0,
    },
  }

  const parts = []
  if (request.systemInstruction) {
    parts.push({ text: `System: ${request.systemInstruction}\n\n` })
  }
  parts.push({ text: request.prompt })

  const result = await model.generateContentStream({
    contents: [{ role: 'user', parts }],
    generationConfig,
  })

  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) {
      yield text
    }
  }
}
