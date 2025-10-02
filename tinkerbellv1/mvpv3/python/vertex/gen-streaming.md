# Streaming Vertex Gemini Responses (Python)

## Streaming Generation

```python
from vertexai.preview.generative_models import GenerativeModel

streaming_model = GenerativeModel("gemini-1.5-flash-001")

stream = streaming_model.generate_content(
    [
        {
            "role": "user",
            "parts": [{"text": "Draft a welcome email for beta users."}],
        }
    ],
    stream=True,
)

buffer = []
for chunk in stream:
    if chunk.text:
        print(chunk.text, end="", flush=True)
        buffer.append(chunk.text)
```

## Chat Streams

```python
chat = streaming_model.start_chat(history=[])
response = chat.send_message("Suggest a subject line.", stream=True)

for chunk in response:
    if chunk.text:
        print(chunk.text, end="", flush=True)
```

## Observability
- Cloud Logging captures streaming traces; filter by `resource.type="aiplatform.googleapis.com/Prediction"`.
- Add `labels={"session_id": session_id}` to correlate with front-end events.

## DRY History Management
- Store conversation history in Firestore/Redis keyed by session.
- Trim to last 10 turns to control token usage.
- Reuse utilities documented in `../../shared/prompt-design.md`.
