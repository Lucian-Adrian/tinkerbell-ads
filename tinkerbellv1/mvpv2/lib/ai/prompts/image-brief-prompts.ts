import type { Script } from '@/types/database'

/**
 * Generate prompt for image brief creation
 */
export function createImageBriefPrompt(script: Script): string {
  return `You are an expert creative director specializing in B2B marketing visuals. Create an image generation brief for this ad script.

## Ad Script
**Headline**: ${script.headline}
**Body**: ${script.body}
**Hook**: ${script.idea_json.hook}
**Benefit**: ${script.idea_json.benefit}

## Instructions
Create a detailed image generation prompt that:
1. **Visually represents the core message** - captures the essence of the script
2. **Is B2B appropriate** - professional yet engaging
3. **Is attention-grabbing** - stands out in a feed
4. **Supports the headline** - complements, doesn't repeat
5. **Uses modern marketing aesthetics** - contemporary, high-quality

Provide:
- **prompt**: Detailed image generation prompt (100-200 words)
- **style**: Visual style descriptor (e.g., "modern corporate photography")
- **aspectRatio**: Best aspect ratio for this content (use "16:9" for social media)
- **numberOfImages**: Always 4
- **keywords**: 3-5 visual keywords

Return ONLY valid JSON matching this structure:
{
  "prompt": "string",
  "style": "string",
  "aspectRatio": "16:9",
  "numberOfImages": 4,
  "keywords": ["string"]
}

Make the prompt specific, vivid, and optimized for AI image generation.`
}

/**
 * JSON Schema for image brief
 */
export const imageBriefSchema = {
  type: 'object',
  properties: {
    prompt: { type: 'string' },
    style: { type: 'string' },
    aspectRatio: { type: 'string' },
    numberOfImages: { type: 'number' },
    keywords: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['prompt', 'style', 'aspectRatio', 'numberOfImages', 'keywords'],
}
