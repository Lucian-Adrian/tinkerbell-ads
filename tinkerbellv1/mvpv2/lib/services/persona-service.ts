import { generateStructuredOutput } from '../ai/gemini/structured-output'
import {
  createPersonaGenerationPrompt,
  personaGenerationSchema,
} from '../ai/prompts/persona-generation'
import { createPersonas } from '../supabase/database/personas'
import { logger } from '@/lib/utils/logger'
import { DEFAULT_TEMPERATURES } from '@/lib/constants/temperatures'
import type { CompanyMetadata, PersonaData } from '@/types/database'
import type { PersonaGenerationOutput } from '@/types/ai'

/**
 * Generate personas for a company
 */
export async function generatePersonasForCompany(
  companyId: string,
  companyUrl: string,
  uvp: string,
  metadata: CompanyMetadata
): Promise<Array<{ id: string; name: string; data: PersonaData }>> {
  logger.info('Generating personas for company', { companyId })

  // Generate prompt
  const prompt = createPersonaGenerationPrompt(companyUrl, uvp, metadata)

  // Call Gemini
  const result = await generateStructuredOutput<PersonaGenerationOutput>({
    prompt,
    schema: personaGenerationSchema,
    systemInstruction: 'You are an expert B2B marketing strategist specializing in buyer persona development.',
    temperature: DEFAULT_TEMPERATURES.persona_generation,
  })

  // Validate we got 3 personas
  if (!result.data.personas || result.data.personas.length !== 3) {
    throw new Error(`Expected 3 personas, got ${result.data.personas?.length || 0}`)
  }

  logger.info('Generated personas', {
    companyId,
    count: result.data.personas.length,
    names: result.data.personas.map(p => p.name),
  })

  // Store in database
  const personasToInsert = result.data.personas.map(persona => ({
    company_id: companyId,
    name: persona.name,
    persona_json: persona as PersonaData,
  }))

  const savedPersonas = await createPersonas(personasToInsert)

  return savedPersonas.map(p => ({
    id: p.id,
    name: p.name,
    data: p.persona_json,
  }))
}
