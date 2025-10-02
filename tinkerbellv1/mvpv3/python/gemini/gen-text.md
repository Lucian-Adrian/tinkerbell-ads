# Gemini Text Generation (Python)

Review shared setup in `../../shared/authentication.md` and `../../shared/model-catalog.md`.

## Install & Initialize

```bash
pip install google-generativeai python-dotenv
```

```python
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")
```

## Basic Prompt

```python
prompt = (
    "You are a concise release-notes assistant.\n"
    "Summarize the following commits as bullet points.\n\n"
    "Commits:\n"
    "- chore: bump deps\n"
    "- fix: handle null config\n"
    "- feat: add webhook retries\n"
)

response = model.generate_content(prompt)
print(response.text)
```

### Response Introspection
- `response.prompt_feedback` → check for blocked inputs.
- `response.candidates[0].finish_reason` → `STOP`, `SAFETY`, etc.
- `response.usage_metadata` → token counts.

## Streaming

```python
stream = model.generate_content(
    [
        {
            "role": "user",
            "parts": [{"text": "Draft a TL;DR for RFC 12."}]
        }
    ],
    stream=True,
    generation_config={"temperature": 0.4}
)

chunks = []
for chunk in stream:
    if chunk.text:
        print(chunk.text, end="", flush=True)
        chunks.append(chunk.text)

tldr = "".join(chunks)
```

## Batching
- Wrap calls in `asyncio.gather` or `concurrent.futures.ThreadPoolExecutor` with backoff.
- Throttle near quota using `time.sleep(0.1)` between requests.
- Cache deterministic outputs (temperature/top_p = 0) to reduce spend.

Proceed to `gen-text-configure.md` for parameter tuning.
