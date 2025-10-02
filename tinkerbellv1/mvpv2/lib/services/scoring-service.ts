import { generateStructuredOutput } from '../ai/gemini/structured-output'
import { createScoringPrompt, scoringSchema } from '../ai/prompts/scoring-prompts'
import { createScore } from '../supabase/database/scores'
import { getScript } from '../supabase/database/scripts'
import { calculateFinalScore } from '@/lib/constants/scoring-weights'
import { DEFAULT_TEMPERATURES } from '@/lib/constants/temperatures'
import { logger } from '@/lib/utils/logger'
import type { ScoringOutput } from '@/types/ai'

/**
 * Calculate ViralCheck score for a script
 */
export async function calculateScriptScore(scriptId: string): Promise<{
  trendScore: number
  llmScore: number
  viralScore: number
  finalScore: number
  rationale: string
}> {
  logger.info('Calculating score for script', { scriptId })

  // Get script
  const script = await getScript(scriptId)
  if (!script) {
    throw new Error('Script not found')
  }

  // Calculate trend score (Google Trends)
  const trendScore = await calculateTrendScore(script.keywords)

  // Calculate LLM score (Gemini analysis)
  const llmResult = await calculateLLMScore(script)

  // Calculate viral score (pattern matching - simplified for MVP)
  const viralScore = await calculateViralScore(script)

  // Calculate final weighted score
  const finalScore = calculateFinalScore(llmResult.llmScore, trendScore, viralScore)

  logger.info('Score calculated', {
    scriptId,
    trendScore,
    llmScore: llmResult.llmScore,
    viralScore,
    finalScore,
  })

  // Store in database
  await createScore({
    script_id: scriptId,
    trend_score: trendScore,
    llm_score: llmResult.llmScore,
    viral_score: viralScore,
    final_score: finalScore,
    rationale: llmResult.rationale,
  })

  return {
    trendScore,
    llmScore: llmResult.llmScore,
    viralScore,
    finalScore,
    rationale: llmResult.rationale,
  }
}

/**
 * Calculate trend score using Google Trends
 * Simplified implementation for MVP
 */
async function calculateTrendScore(keywords: string[]): Promise<number> {
  // TODO: Implement actual Google Trends API integration
  // For MVP, use a simplified heuristic based on keyword quality
  
  if (keywords.length === 0) return 50

  // Simple heuristic: longer, more specific keywords score higher
  const avgLength = keywords.reduce((sum, k) => sum + k.length, 0) / keywords.length
  const uniqueness = new Set(keywords).size / keywords.length
  
  // Score between 40-80 based on keyword quality
  const score = Math.min(Math.max(40 + avgLength * 2 + uniqueness * 20, 40), 80)
  
  return Math.round(score)
}

/**
 * Calculate LLM score using Gemini
 */
async function calculateLLMScore(script: any): Promise<{
  llmScore: number
  rationale: string
}> {
  const prompt = createScoringPrompt(script)

  const result = await generateStructuredOutput<ScoringOutput>({
    prompt,
    schema: scoringSchema,
    systemInstruction: 'You are an expert B2B marketing analyst.',
    temperature: DEFAULT_TEMPERATURES.scoring,
  })

  return {
    llmScore: result.data.llmScore,
    rationale: result.data.rationale,
  }
}

/**
 * Calculate viral score using pattern matching
 * Simplified implementation for MVP
 */
async function calculateViralScore(script: any): Promise<number> {
  // TODO: Implement actual viral pattern matching with RAG
  // For MVP, use simple heuristics
  
  let score = 50 // Base score

  // Check for viral elements
  const headline = script.headline.toLowerCase()
  const body = script.body.toLowerCase()
  const combined = headline + ' ' + body

  // Emotional triggers
  if (/\b(shocking|amazing|unbelievable|secret|revealed)\b/.test(combined)) {
    score += 10
  }

  // Numbers (specific claims)
  if (/\d+[%x]|\d+\s*(times|ways|reasons)/.test(combined)) {
    score += 10
  }

  // Questions
  if (headline.includes('?')) {
    score += 5
  }

  // Urgency
  if (/\b(now|today|limited|don't miss)\b/.test(combined)) {
    score += 10
  }

  // Benefit-focused
  if (/\b(save|increase|reduce|improve|boost)\b/.test(combined)) {
    score += 10
  }

  return Math.min(score, 100)
}

/**
 * Calculate scores for multiple scripts in parallel
 */
export async function calculateBulkScores(scriptIds: string[]): Promise<void> {
  logger.info('Calculating bulk scores', { count: scriptIds.length })

  const results = await Promise.allSettled(
    scriptIds.map(id => calculateScriptScore(id))
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  logger.info('Bulk scoring complete', { succeeded, failed })
}
