import type { PersonaData, CompanyMetadata } from '@/types/database'
import { getSeedDescription } from '@/lib/constants/seeds'

/**
 * Generate prompt for script generation
 */
export function createScriptGenerationPrompt(
  persona: PersonaData,
  companyInfo: { url: string; uvp: string; metadata: CompanyMetadata },
  seed: string,
  batchNumber: number
): string {
  const seedDesc = getSeedDescription(seed as any)

  return `You are an expert copywriter specializing in guerrilla marketing and viral B2B advertising. Generate 5 unique ad script ideas.

## Target Persona
- **Name**: ${persona.name}
- **Role**: ${persona.role}
- **Top Goals**: ${persona.goals.slice(0, 3).join(', ')}
- **Top Pain Points**: ${persona.painPoints.slice(0, 3).join(', ')}
- **Preferences**: ${persona.preferences.slice(0, 3).join(', ')}

## Company Information
- **UVP**: ${companyInfo.uvp}
- **Industry**: ${companyInfo.metadata.industry || 'B2B Technology'}

## Creative Angle (Batch ${batchNumber})
**${seed.replace(/_/g, ' ').toUpperCase()}**
${seedDesc}

## Instructions
Generate exactly 5 unique ad scripts that:
1. **Target this specific persona** - speak directly to their goals and pain points
2. **Use the creative angle** - incorporate the ${seed} marketing strategy
3. **Are distinctly different** - each script should have a unique hook and approach
4. **Are B2B appropriate** - professional yet attention-grabbing
5. **Drive action** - include a clear, compelling CTA

Each script must include:
- **headline**: Attention-grabbing headline (5-10 words)
- **body**: Core message (50-100 words)
- **cta**: Clear call-to-action (3-7 words)
- **keywords**: 3-5 relevant keywords for trends analysis
- **hook**: The opening hook/attention-getter
- **angle**: The marketing angle used
- **painPoint**: Which persona pain point it addresses
- **solution**: How the product/service solves it
- **benefit**: The key benefit highlighted

Return ONLY valid JSON matching this structure:
{
  "ideas": [
    {
      "headline": "string",
      "body": "string",
      "cta": "string",
      "keywords": ["string"],
      "hook": "string",
      "angle": "string",
      "painPoint": "string",
      "solution": "string",
      "benefit": "string"
    }
  ]
}

Make each script uniquely compelling and different from the others. Use the ${seed} angle creatively.`
}

/**
 * JSON Schema for script generation
 */
export const scriptGenerationSchema = {
  type: 'object',
  properties: {
    ideas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          body: { type: 'string' },
          cta: { type: 'string' },
          keywords: {
            type: 'array',
            items: { type: 'string' },
          },
          hook: { type: 'string' },
          angle: { type: 'string' },
          painPoint: { type: 'string' },
          solution: { type: 'string' },
          benefit: { type: 'string' },
        },
        required: ['headline', 'body', 'cta', 'keywords', 'hook', 'angle', 'painPoint', 'solution', 'benefit'],
      },
    },
  },
  required: ['ideas'],
}
