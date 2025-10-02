# Gemini Text Generation (JavaScript)

Reference the shared setup notes in `../shared/authentication.md` and `../shared/model-catalog.md` before wiring code.

## Install & Import

```bash
npm install @google/generative-ai dotenv
```

```js
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
```

## Basic Text Prompt

```js
const prompt = `You are a concise release-notes assistant.
Summarize the following commits as bullet points.

Commits:
- chore: bump deps
- fix: handle null config
- feat: add webhook retries
`;

const result = await model.generateContent(prompt);
console.log(result.response.text());
```

### Response Object Cheat Sheet
- `response.text()` → concatenated text.
- `response.candidates` → access safety ratings and finish reason.
- `response.promptFeedback` → check if the input was blocked by safety filters.

## Streaming Responses

```js
const stream = await model.generateContentStream({
	contents: [{ role: 'user', parts: [{ text: 'Draft a TL;DR for RFC 12.' }] }],
	generationConfig: { temperature: 0.4 }
});

let tldr = '';
for await (const chunk of stream.stream) {
	tldr += chunk.text();
	process.stdout.write(chunk.text());
}
```

## Batching Requests
- Wrap `model.generateContent` calls in `Promise.allSettled` to handle throttle gracefully.
- Insert `await new Promise(r => setTimeout(r, 100))` between batches when you approach per-minute quotas.
- Cache deterministic prompts (temperature 0, topP 0) in Redis/Edge KV.

## Logging & Observability
- Log `finishReason`, `safetyRatings`, and latency for each request.
- Persist token counts from `response.usageMetadata` for cost estimation.
- Attach prompt + response IDs to bug reports to replay conversations.

Continue with `gen-text-configure.md` for advanced parameters and `gen-text-structured-output.md` for JSON/function calling.
