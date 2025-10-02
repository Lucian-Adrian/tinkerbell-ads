# Video Generation with Gemini Veo (JavaScript)

Veo 003 is currently preview-only and accessed through the Gemini API. Ensure your project has been allow-listed.

## Client Setup

```bash
npm install @google/generative-ai node-fetch dotenv
```

```js
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeFile } from 'node:fs/promises';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const veo = genAI.getGenerativeModel({ model: 'veo-003' });
```

## Text-to-Video Prompt

```js
const response = await veo.generateContent({
	contents: [{
		role: 'user',
		parts: [{
			text: 'A slow pan over a futuristic city at sunset, drones flying between neon skyscrapers.'
		}]
	}],
	generationConfig: {
		videoConfig: {
			aspectRatio: '16:9',
			durationSeconds: 8,
			frameRate: 24,
			motionIntensity: 'medium'
		}
	}
});

const videoPart = response.response.candidates?.[0]?.content?.parts?.find(
	part => part.inlineData?.mimeType === 'video/mp4'
);

await writeFile('futuristic-city.mp4', Buffer.from(videoPart.inlineData.data, 'base64'));
```

## Prompt Crafting
- Provide camera directions ("dolly zoom", "handheld") and visual style ("analog film grain").
- Mention pacing and transitions ("start on skyline, then tilt down to street level").
- Avoid copyrighted character names; Veo will refuse.

## Response Handling
- Video rendering can take 30–60 seconds. Poll `generateContent`? Not needed—the call waits until completion.
- Check `response.response.candidates?.[0]?.finishReason`. If `SAFETY`, inspect `safetyRatings`.

## Seeds & Variations
- Set `generationConfig.seed` for reproducible motion.
- For alternate takes, keep the same prompt, change seed (`Math.floor(Math.random() * 1e9)`).

Consult `gen-video-parameters.md` for deeper parameter references and guardrails.
