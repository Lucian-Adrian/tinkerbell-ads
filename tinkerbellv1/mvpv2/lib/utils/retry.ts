import { logger } from './logger'

/**
 * Retry Configuration
 */
export interface RetryConfig {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  shouldRetry?: (error: any) => boolean
}

const defaultConfig: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  shouldRetry: () => true,
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig = { ...defaultConfig, ...config }
  let lastError: any

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === finalConfig.maxAttempts || !finalConfig.shouldRetry(error)) {
        throw error
      }

      const delay = Math.min(
        finalConfig.initialDelay * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
        finalConfig.maxDelay
      )

      logger.warn(
        `Attempt ${attempt}/${finalConfig.maxAttempts} failed, retrying in ${delay}ms...`,
        error
      )

      await sleep(delay)
    }
  }

  throw lastError
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Retry on network errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true
  }

  // Retry on 5xx errors
  if (error.statusCode && error.statusCode >= 500) {
    return true
  }

  // Retry on 429 (rate limit)
  if (error.statusCode === 429) {
    return true
  }

  return false
}
