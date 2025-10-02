# Streaming & Conversation State (JavaScript)

Use streaming to power chat UIs with low latency.

## Streaming Chat Loop

```js
const streamingModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const history = [
  {
    role: 'user',
    parts: [{ text: 'You are a helpful travel agent.' }]
  }
];

async function sendMessage(message) {
  history.push({ role: 'user', parts: [{ text: message }] });

  const stream = await streamingModel.generateContentStream({ contents: history });

  let buffer = '';
  for await (const chunk of stream.stream) {
    buffer += chunk.text();
    process.stdout.write(chunk.text());
  }

  history.push({ role: 'model', parts: [{ text: buffer }] });
}
```

## Handling Interruptions
+- Use `stream.response` promise to capture metadata once the stream finishes.
+- Abort with `AbortController` if the user cancels mid-stream.
+- Persist conversation history in Redis; trim to last N turns to stay within context budget.

## Token Budgeting
+- `stream.usageMetadata` arrives at the end. Update analytics dashboards to monitor cost.
+- For multi-user rooms, create separate model instances per thread to avoid crosstalk.

## Latency Optimization
+- Preload the model instance outside hot paths (e.g., server cold starts). The first request may take ~1s to warm up.
+- Use HTTP keep-alive when deploying behind Cloud Run/Functions; Node fetch defaults are fine.

Use identical conversation state mechanics in Python; only the SDK surface differs.
