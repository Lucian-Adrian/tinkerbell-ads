// Scoring Weights for ViralCheck Formula
// final_score = (llm_score * LLM_WEIGHT) + (trend_score * TREND_WEIGHT) + (viral_score * VIRAL_WEIGHT)

export const SCORING_WEIGHTS = {
  llm: 0.45,
  trend: 0.35,
  viral: 0.20,
} as const

// Validate weights sum to 1
const weightSum = Object.values(SCORING_WEIGHTS).reduce((a, b) => a + b, 0)
if (Math.abs(weightSum - 1.0) > 0.01) {
  console.warn('Scoring weights do not sum to 1.0:', weightSum)
}

/**
 * Calculate final ViralCheck score
 */
export function calculateFinalScore(
  llmScore: number,
  trendScore: number,
  viralScore: number
): number {
  const final =
    llmScore * SCORING_WEIGHTS.llm +
    trendScore * SCORING_WEIGHTS.trend +
    viralScore * SCORING_WEIGHTS.viral

  return Math.round(final * 100) / 100 // Round to 2 decimals
}

/**
 * Score thresholds for classification
 */
export const SCORE_THRESHOLDS = {
  excellent: 80,
  good: 65,
  average: 50,
  poor: 35,
} as const

/**
 * Get score classification
 */
export function getScoreClassification(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return 'excellent'
  if (score >= SCORE_THRESHOLDS.good) return 'good'
  if (score >= SCORE_THRESHOLDS.average) return 'average'
  if (score >= SCORE_THRESHOLDS.poor) return 'poor'
  return 'very_poor'
}

/**
 * Get score color for UI
 */
export function getScoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return 'green'
  if (score >= SCORE_THRESHOLDS.good) return 'blue'
  if (score >= SCORE_THRESHOLDS.average) return 'yellow'
  if (score >= SCORE_THRESHOLDS.poor) return 'orange'
  return 'red'
}
