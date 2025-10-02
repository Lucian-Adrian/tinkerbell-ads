/**
 * Gemini Thinking Configuration
 * Controls the "thinking" behavior of Gemini 2.5 models
 */

/**
 * Thinking budgets for different use cases
 */
export const THINKING_BUDGETS = {
  DISABLED: 0, // No thinking - fastest
  MINIMAL: 1024, // Minimal thinking
  MODERATE: 4096, // Moderate thinking
  EXTENSIVE: 8192, // Extensive thinking
  MAXIMUM: 16384, // Maximum thinking
} as const

/**
 * Get thinking budget for specific task
 */
export function getThinkingBudget(task: 'persona' | 'script' | 'scoring' | 'brief'): number {
  switch (task) {
    case 'persona':
      return THINKING_BUDGETS.DISABLED // Fast persona generation
    case 'script':
      return THINKING_BUDGETS.DISABLED // Fast script generation
    case 'scoring':
      return THINKING_BUDGETS.MINIMAL // Some thinking for scoring
    case 'brief':
      return THINKING_BUDGETS.DISABLED // Fast brief generation
    default:
      return THINKING_BUDGETS.DISABLED
  }
}
