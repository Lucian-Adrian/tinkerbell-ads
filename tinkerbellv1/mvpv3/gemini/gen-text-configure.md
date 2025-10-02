# Tuning Gemini Generation Parameters (JavaScript)

Gemini models expose sampling knobs via `generationConfig`. Compose them instead of hard-coding magic numbers.

```js
const baseConfig = {
	temperature: 0.4,
	topK: 32,
	topP: 0.9,
	maxOutputTokens: 1024,
	responseMimeType: 'text/plain'
};

const safetySettings = [
	{ category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
	{ category: 'HARM_CATEGORY_SEXUAL', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
];

const model = genAI.getGenerativeModel({
	model: 'gemini-1.5-pro',
	safetySettings
});

const response = await model.generateContent({
	contents: [{ role: 'user', parts: [{ text: prompt }] }],
	generationConfig: {
		...baseConfig,
		temperature: 0.2,
		stopSequences: ['END_OF_SECTION']
	}
});
```

## Parameter Playbook

| Parameter | Typical range | Behavior |
| --- | --- | --- |
| `temperature` | `0.0` – `1.2` | Creativity vs determinism. Use ≤ `0.3` for deterministic summarization. |
| `topP` | `0.1` – `1.0` | Nucleus sampling. Lower for stricter outputs. |
| `topK` | `1` – `64` | Limits candidate tokens per step. Smaller = faster. |
| `maxOutputTokens` | Up to 8192 (Flash) / 8192+ (Pro) | Hard cap on response length. |
| `responseMimeType` | `text/plain`, `application/json`, `text/markdown` | Signals the expected output format. |
| `stopSequences` | array of strings | Model halts when encountering any sequence. |

## Context Window Management
- Track `response.usageMetadata.totalTokens`; trim prompts when approaching 1M tokens on 1.5 models.
- Chunk large corpora and summarize iteratively; store intermediate embeddings (see `gen-embeddings.md`).

## Deterministic Pipelines
Set both `temperature` and `topP` to 0 for deterministic pipelines (e.g., invoice parsing). Pair with `responseMimeType: 'application/json'` and schema validation.

## Guarding Against Safety Blocks
- Inspect `response.promptFeedback.blockReason`. If defined, return fallback UI plus remediation tips for the end user.
- Adjust `safetySettings` per policy—but never set thresholds lower than `BLOCK_MEDIUM_AND_ABOVE` without legal approval.

## Reusable Config Modules
Create config factories for different workloads to stay DRY:

```js
export const configs = {
	summarizer: {
		temperature: 0.2,
		topP: 0.8,
		maxOutputTokens: 512
	},
	ideation: {
		temperature: 0.8,
		topP: 0.95,
		maxOutputTokens: 2048
	}
};
```

Share these objects across serverless functions, background jobs, and CLIs to ensure consistent behavior.
