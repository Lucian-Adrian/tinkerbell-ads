# Configuring Vertex Gemini Calls (JavaScript)

Vertex exposes the same parameters as the consumer API plus enterprise options.

## Generation Config

```js
const config = {
  temperature: 0.3,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 1024,
  stopSequences: ['END_OF_NOTE'],
  responseMimeType: 'text/plain'
};

const result = await generativeModel.generateContent({
  contents,
  generationConfig: config
});
```

## Safety Settings

```js
const safetySettings = [
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
  }
];

const safeModel = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-pro-preview-0514',
  safetySettings
});
```

## Response Metadata
- `result.response.usageMetadata.totalTokenCount` → billable tokens.
- `result.response.candidates[0].finishReason` → `STOP`, `SAFETY`, `MAX_TOKENS`, etc.
- `result.response.candidates[0].citationMetadata.citations` → citations for connected search (requires enabling).

## Regional Failover
- Deploy multiple Cloud Run services, one per region (`us-central1`, `us-west1`).
- Use load balancer or routing layer to pick region based on latency.
- Cache generationConfig presets in Firestore/Redis to keep them consistent across regions.

## DRY Strategy
- Export configuration objects from a shared library (`libs/vertex-configs.js`).
- Reuse the same config objects across vertex text, chat, and tool calling flows to avoid divergence.

Move to `gen-text-structured-output.md` for JSON/schema workflows.