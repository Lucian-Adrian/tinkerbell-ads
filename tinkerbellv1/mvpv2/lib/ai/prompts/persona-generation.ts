import type { CompanyMetadata } from '@/types/database'

/**
 * Generate prompt for persona creation
 */
export function createPersonaGenerationPrompt(
  companyUrl: string,
  uvp: string,
  metadata: CompanyMetadata
): string {
  return `You are an expert marketing strategist and customer research specialist. Generate 3 detailed buyer personas for this B2B company.

## Company Information
- **Website**: ${companyUrl}
- **Unique Value Proposition**: ${uvp}
- **Company Name**: ${metadata.title || 'Unknown'}
- **Description**: ${metadata.description || 'No description available'}
- **Industry**: ${metadata.industry || 'Technology/B2B'}
- **Target Audience**: ${metadata.targetAudience || 'Business professionals'}

## Context from Website
${metadata.content?.substring(0, 1000) || 'Limited content available'}

## Instructions
Generate exactly 3 distinct buyer personas that represent the company's ideal customers. Each persona should be:
1. **Realistic and specific** - based on actual B2B buyer characteristics
2. **Different from each other** - covering different roles, goals, and pain points
3. **Relevant to the UVP** - aligned with what the company offers

For each persona, include:
- **name**: A realistic name (e.g., "Sarah Chen" or "Michael Rodriguez")
- **age**: Age range (e.g., 35)
- **role**: Job title and responsibilities
- **goals**: 3-5 specific professional goals
- **painPoints**: 3-5 specific challenges they face
- **behaviors**: 3-5 behavioral characteristics (how they work, research, decide)
- **preferences**: 3-5 preferences for solutions, communication, content
- **demographics**: Object with location, income, education

Return ONLY valid JSON matching this structure:
{
  "personas": [
    {
      "name": "string",
      "age": number,
      "role": "string",
      "goals": ["string"],
      "painPoints": ["string"],
      "behaviors": ["string"],
      "preferences": ["string"],
      "demographics": {
        "location": "string",
        "income": "string",
        "education": "string"
      }
    }
  ]
}

Generate diverse, realistic personas that would actually use this B2B product/service.`
}

/**
 * JSON Schema for persona generation
 */
export const personaGenerationSchema = {
  type: 'object',
  properties: {
    personas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          role: { type: 'string' },
          goals: {
            type: 'array',
            items: { type: 'string' },
          },
          painPoints: {
            type: 'array',
            items: { type: 'string' },
          },
          behaviors: {
            type: 'array',
            items: { type: 'string' },
          },
          preferences: {
            type: 'array',
            items: { type: 'string' },
          },
          demographics: {
            type: 'object',
            properties: {
              location: { type: 'string' },
              income: { type: 'string' },
              education: { type: 'string' },
            },
          },
        },
        required: ['name', 'age', 'role', 'goals', 'painPoints', 'behaviors', 'preferences', 'demographics'],
      },
    },
  },
  required: ['personas'],
}
