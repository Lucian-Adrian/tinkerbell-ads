# Image Generation with Gemini (JavaScript)

Gemini surfaces Imagen 3 via the consumer API. For enterprise, see `../vertex/gen-image.md`.

## Install Helpers

```bash
npm install @google/generative-ai sharp dotenv
```

`sharp` lets you turn base64 outputs into PNG/JPEG buffers.

## Single Image Prompt

```js
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const imagen = genAI.getGenerativeModel({ model: 'imagen-3' });

const response = await imagen.generateContent({
	contents: [{
		role: 'user',
		parts: [{ text: 'A cozy reading nook with warm lighting and a cat on the chair.' }]
	}],
	generationConfig: {
		temperature: 0.2,
		maxOutputTokens: 2048
	}
});

const imageBase64 = response.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
const buffer = Buffer.from(imageBase64, 'base64');
await sharp(buffer).png().toFile('reading-nook.png');
```

## Aspect Ratio & Quality
- Imagen 3 supports `256x256` up to `2048x2048`.
- Provide `generationConfig.imageGenerationConfig = { aspectRatio: '3:2', quality: 'high' }` (currently preview-only).
- Larger images increase latency; measure before shipping to production.

## Negative Prompts
Add `negativePrompt` to steer away from unwanted traits:

```js
const result = await imagen.generateContent({
	contents: [...],
	generationConfig: {
		negativePrompt: 'No text, no watermark, no people',
		temperature: 0.4
	}
});
```

## Rate Limiting
- Imagen 3 is slower (~10–20s). Queue requests using BullMQ or Cloud Tasks.
- Cache generated URLs for reuse; dedupe prompts with a hash of prompt + seed.

## Seeds & Variations
- Set `generationConfig.seed` for reproducible results.
- Send multiple prompts in a single call? Not yet supported—submit sequentially.

Continue to `gen-image-prompt.md` for multimodal conditioning examples.
