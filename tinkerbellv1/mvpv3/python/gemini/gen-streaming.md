# Streaming Conversations (Python)

## Streaming Chat Loop

```python
import google.generativeai as genai

chat = genai.GenerativeModel("gemini-1.5-flash").start_chat(history=[])

response = chat.send_message("You are a helpful travel agent.")
print(response.text)

stream = chat.send_message(
    "Find three weekend getaways near Seattle.",
    stream=True,
)

buffer = []
for chunk in stream:
    if chunk.text:
        print(chunk.text, end="", flush=True)
        buffer.append(chunk.text)

history = chat.history
```

## Abort Handling
- Wrap stream iteration with `try/except KeyboardInterrupt`.
- Use `asyncio.TimeoutError` when running in async frameworks.

## Token Budget
- `chunk.usage_metadata` is available on the final chunk.
- Trim `chat.history` to the last `n` turns to stay under 1M-token context.

## Latency Optimizations
- Initialize `GenerativeModel` once per worker.
- Reuse HTTP session by configuring `genai.configure(client_options={"api_endpoint": ...})`.

Apply the same history management guidelines documented in `../../shared/prompt-design.md`.
