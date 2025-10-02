import { generateStructuredOutput } from '../ai/gemini/structured-output'
import {
  createScriptGenerationPrompt,
  scriptGenerationSchema,
} from '../ai/prompts/script-generation'
import { createScriptBatch, createScripts, updateScriptBatchStatus } from '../supabase/database/scripts'
import { getCompany } from '../supabase/database/companies'
import { getPersona } from '../supabase/database/personas'
import { getSeedByIndex } from '@/lib/constants/seeds'
import { getTemperatureForBatch } from '@/lib/constants/temperatures'
import { logger } from '@/lib/utils/logger'
import type { PersonaData, ScriptIdeaData } from '@/types/database'
import type { ScriptGenerationOutput } from '@/types/ai'

/**
 * Generate scripts for a persona in batches
 */
export async function generateScriptsForPersona(
  personaId: string,
  numberOfBatches: number = 4
): Promise<{ batchIds: string[]; totalScripts: number }> {
  logger.info('Generating scripts for persona', { personaId, numberOfBatches })

  // Get persona and company
  const persona = await getPersona(personaId)
  if (!persona) {
    throw new Error('Persona not found')
  }

  const company = await getCompany(persona.company_id)
  if (!company) {
    throw new Error('Company not found')
  }

  const batchIds: string[] = []
  let totalScripts = 0

  // Generate each batch
  for (let i = 0; i < numberOfBatches; i++) {
    const seed = getSeedByIndex(i)
    const temperature = getTemperatureForBatch(i)

    logger.info(`Generating batch ${i + 1}/${numberOfBatches}`, { seed, temperature })

    try {
      // Create batch record
      const batch = await createScriptBatch({
        company_id: company.id,
        persona_id: personaId,
        seed_template: seed,
        temperature,
        status: 'processing',
      })

      batchIds.push(batch.id)

      // Generate scripts for this batch
      const scripts = await generateScriptBatch(
        persona.persona_json,
        {
          url: company.url,
          uvp: company.uvp,
          metadata: company.metadata || {},
        },
        seed,
        temperature,
        i + 1
      )

      // Save scripts
      const scriptsToInsert = scripts.map(script => ({
        batch_id: batch.id,
        persona_id: personaId,
        headline: script.headline,
        body: script.body,
        cta: script.cta,
        keywords: script.keywords,
        idea_json: {
          hook: script.hook,
          angle: script.angle,
          painPoint: script.painPoint,
          solution: script.solution,
          benefit: script.benefit,
        } as ScriptIdeaData,
      }))

      await createScripts(scriptsToInsert)
      totalScripts += scripts.length

      // Update batch status
      await updateScriptBatchStatus(batch.id, 'completed')

      logger.info(`Batch ${i + 1} completed`, { scriptsGenerated: scripts.length })
    } catch (error) {
      logger.error(`Batch ${i + 1} failed`, error)
      throw error
    }
  }

  logger.info('All batches completed', { totalScripts, batches: numberOfBatches })

  return { batchIds, totalScripts }
}

/**
 * Generate a single batch of scripts
 */
async function generateScriptBatch(
  persona: PersonaData,
  companyInfo: any,
  seed: string,
  temperature: number,
  batchNumber: number
): Promise<Array<{
  headline: string
  body: string
  cta: string
  keywords: string[]
  hook: string
  angle: string
  painPoint: string
  solution: string
  benefit: string
}>> {
  // Generate prompt
  const prompt = createScriptGenerationPrompt(persona, companyInfo, seed, batchNumber)

  // Call Gemini
  const result = await generateStructuredOutput<ScriptGenerationOutput>({
    prompt,
    schema: scriptGenerationSchema,
    systemInstruction: 'You are an expert B2B copywriter specializing in guerrilla marketing.',
    temperature,
  })

  // Validate we got 5 ideas
  if (!result.data.ideas || result.data.ideas.length !== 5) {
    logger.warn(`Expected 5 ideas, got ${result.data.ideas?.length || 0}`)
  }

  return result.data.ideas
}
