import type { Script } from '@/types/database'

/**
 * Generate prompt for video brief creation
 */
export function createVideoBriefPrompt(script: Script): string {
  return `You are an expert video creative director specializing in short-form B2B marketing content. Create a video generation brief for this ad script.

## Ad Script
**Headline**: ${script.headline}
**Body**: ${script.body}
**Hook**: ${script.idea_json.hook}
**Benefit**: ${script.idea_json.benefit}
**CTA**: ${script.cta}

## Constraints
- **Duration**: 6 seconds (very short)
- **No Audio**: Video will be silent (visual storytelling only)
- **Format**: Social media (vertical or horizontal)

## Instructions
Create a concise video generation prompt that:
1. **Tells a micro-story** - beginning, middle, end in 6 seconds
2. **Is purely visual** - no reliance on audio or text
3. **Captures attention instantly** - hook in first second
4. **Conveys the key benefit** - visual metaphor or demonstration
5. **Is B2B appropriate** - professional quality

Provide:
- **prompt**: Detailed 6-second video prompt (100-150 words, describe each 2-second segment)
- **duration**: Always 6
- **style**: Visual style (e.g., "professional corporate b-roll")
- **keywords**: 3-5 visual keywords
- **noAudio**: Always true

Return ONLY valid JSON matching this structure:
{
  "prompt": "string",
  "duration": 6,
  "style": "string",
  "keywords": ["string"],
  "noAudio": true
}

Describe the visual sequence clearly. Remember: 6 seconds total, silent, attention-grabbing.`
}

/**
 * JSON Schema for video brief
 */
export const videoBriefSchema = {
  type: 'object',
  properties: {
    prompt: { type: 'string' },
    duration: { type: 'number' },
    style: { type: 'string' },
    keywords: {
      type: 'array',
      items: { type: 'string' },
    },
    noAudio: { type: 'boolean' },
  },
  required: ['prompt', 'duration', 'style', 'keywords', 'noAudio'],
}
