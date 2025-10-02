import type { Script } from '@/types/database'

/**
 * Generate prompt for LLM scoring
 */
export function createScoringPrompt(script: Script): string {
  return `You are an expert marketing analyst specializing in B2B advertising performance prediction. Evaluate this ad script for viral potential and business impact.

## Ad Script to Evaluate
**Headline**: ${script.headline}

**Body**: ${script.body}

**CTA**: ${script.cta}

**Keywords**: ${script.keywords.join(', ')}

**Marketing Angle**: ${script.idea_json.angle}

**Pain Point Addressed**: ${script.idea_json.painPoint}

## Evaluation Criteria
Rate this script on a scale of 0-100 based on:

1. **Attention-Grabbing Power** (0-20)
   - Does the headline immediately capture attention?
   - Is the hook compelling and unique?

2. **Relevance & Targeting** (0-20)
   - How well does it address the target audience's pain point?
   - Is the solution clear and believable?

3. **Emotional Impact** (0-20)
   - Does it evoke emotion (curiosity, urgency, desire)?
   - Is there a strong reason to act now?

4. **Clarity & Persuasion** (0-20)
   - Is the message clear and easy to understand?
   - Is the value proposition compelling?

5. **Viral Potential** (0-20)
   - Is it memorable and shareable?
   - Does it have a unique angle or surprise element?

## Instructions
Provide:
1. **llmScore**: Overall score (0-100) - sum of the 5 criteria
2. **rationale**: 2-3 sentences explaining the score
3. **strengths**: Array of 2-3 specific strengths
4. **weaknesses**: Array of 1-2 specific weaknesses
5. **suggestions**: Array of 2-3 actionable improvements

Return ONLY valid JSON matching this structure:
{
  "llmScore": number,
  "rationale": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggestions": ["string"]
}

Be honest and analytical. A score of 70+ is excellent, 50-69 is good, below 50 needs improvement.`
}

/**
 * JSON Schema for scoring
 */
export const scoringSchema = {
  type: 'object',
  properties: {
    llmScore: { type: 'number', minimum: 0, maximum: 100 },
    rationale: { type: 'string' },
    strengths: {
      type: 'array',
      items: { type: 'string' },
    },
    weaknesses: {
      type: 'array',
      items: { type: 'string' },
    },
    suggestions: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['llmScore', 'rationale', 'strengths', 'weaknesses', 'suggestions'],
}
