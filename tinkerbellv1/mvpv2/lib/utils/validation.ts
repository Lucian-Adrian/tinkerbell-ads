import { z } from 'zod'

/**
 * Validation schemas using Zod
 */

// URL validation
export const urlSchema = z.string().url('Invalid URL format')

// UVP (Unique Value Proposition) validation
export const uvpSchema = z
  .string()
  .min(10, 'UVP must be at least 10 characters')
  .max(500, 'UVP must be less than 500 characters')

// Email validation
export const emailSchema = z.string().email('Invalid email address')

// Ingest request validation
export const ingestRequestSchema = z.object({
  url: urlSchema,
  uvp: uvpSchema,
})

// Persona ID validation
export const personaIdSchema = z.string().uuid('Invalid persona ID')

// Script generation request validation
export const generateScriptsRequestSchema = z.object({
  personaId: personaIdSchema,
  batches: z.number().int().min(1).max(10).optional().default(4),
})

// Score calculation request validation
export const calculateScoresRequestSchema = z.object({
  scriptId: z.string().uuid().optional(),
  scriptIds: z.array(z.string().uuid()).optional(),
})

// Asset generation request validation
export const generateImagesRequestSchema = z.object({
  scriptIds: z.array(z.string().uuid()).min(1).max(10),
})

export const generateVideosRequestSchema = z.object({
  scriptIds: z.array(z.string().uuid()).min(1).max(3),
})

/**
 * Validate data against a schema
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Safe validate that returns result or error
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

/**
 * Check if string is valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Check if string is valid UUID
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
