# Multimodal Prompts for Imagen (JavaScript)

Combine text, sketches, or reference photos to refine generations.

## Referencing Uploaded Images
1. Upload a reference asset to Google Cloud Storage or your CDN.
2. Convert to base64 if you need inline conditioning.

```js
import { readFile } from 'node:fs/promises';

const ref = await readFile('moodboard.jpg');
const refBase64 = ref.toString('base64');

const response = await imagen.generateContent({
	contents: [{
		role: 'user',
		parts: [
			{ text: 'Design a minimalist app onboarding screen inspired by this palette.' },
			{
				inlineData: {
					mimeType: 'image/jpeg',
					data: refBase64
				}
			}
		]
	}]
});
```

## Sketch + Text Workflow
- Provide a line-art PNG as the first part.
- Add textual instructions to clarify styling, colors, or layout.
- Use `negativePrompt` to prevent undesired artifacts (e.g., "no text labels").

## Prompt Engineering Tips
- Start with broad descriptors, then iterate by adjusting adjectives ("dramatic lighting", "macro lens").
- Prefer concrete nouns over metaphors; Imagen responds better to tangible details.
- Limit prompts to ~300 tokens; longer descriptions rarely improve quality.

## Iterative Refinement Loop
1. Generate initial image.
2. Collect human feedback metadata (liked colors, disliked objects).
3. Append delta instructions: `"Keep the blue gradient, remove the bird, add soft shadows."`
4. Re-run generation with same seed for controlled variation.

## Safety & Compliance
- Respect policy: avoid prompts that may be rejected (violence, explicit content, trademarks).
- Inspect `response.promptFeedback.blockReason`. Show a friendly message and let users adjust their prompt.

Reuse helper utilities (image encoding, prompt templating) between Node and Python clients to stay DRY; store them in a shared library module.
