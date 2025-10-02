# Streaming with Vertex Gemini (JavaScript)

`startChat` and `generateContentStream` support token streaming with enterprise observability.

## Streaming Response

```js
const streamingModel = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });

const stream = await streamingModel.generateContentStream({
  contents: [{ role: 'user', parts: [{ text: 'Draft a welcome email for beta users.' }] }]
});

let text = '';
for await (const chunk of stream.stream) {
  text += chunk.text();
  process.stdout.write(chunk.text());
}
```

## Chat Sessions

```js
const chat = streamingModel.startChat({ history: [] });
const response = await chat.sendMessageStream('Suggest a subject line.');

for await (const chunk of response.stream) {
  process.stdout.write(chunk.text());
}
```

## Observability
- Cloud Logging captures streaming events; filter by `resource.type = "aiplatform.googleapis.com/Prediction"`.
- Attach `labels.session_id` to correlate front-end sessions with backend traces.

## DRY Conversation Management
- Store history in Firestore or Redis keyed by `sessionId`.
- Limit history to the last 10 turns to control token usage.
- Share conversation utility code with Python via spec docs in `../shared/prompt-design.md`.
