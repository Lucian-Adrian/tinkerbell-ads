# Tuning Gemini Generation (Python)

Use `generation_config` to control sampling.

```python
base_config = {
    "temperature": 0.4,
    "top_k": 32,
    "top_p": 0.9,
    "max_output_tokens": 1024,
    "response_mime_type": "text/plain",
}

safety_settings = [
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
        "category": "HARM_CATEGORY_SEXUAL",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
    },
]

model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    safety_settings=safety_settings,
)

response = model.generate_content(
    prompt,
    generation_config={
        **base_config,
        "temperature": 0.2,
        "stop_sequences": ["END_OF_SECTION"],
    },
)
```

## Parameter Cheatsheet

| Parameter | Typical range | Notes |
| --- | --- | --- |
| `temperature` | 0.0–1.2 | Lower = deterministic. |
| `top_p` | 0.1–1.0 | Nucleus sampling. |
| `top_k` | 1–64 | Token candidate limit. |
| `max_output_tokens` | up to 8192 | Cap response length. |
| `response_mime_type` | text/plain, application/json | Encourages structured output. |
| `stop_sequences` | list[str] | Ends generation when matched. |

## Context Management
- Monitor `response.usage_metadata.total_tokens`.
- Chunk large sources and summarize progressively.
- Persist embeddings (see `../gen-embeddings.md`) for retrieval-augmented prompting.

## Deterministic Flows
Set both `temperature` and `top_p` to `0`. Combine with JSON output to eliminate parsing errors.

## Handling Safety Blocks
- Inspect `response.prompt_feedback.block_reason`.
- Provide user-friendly remediation suggestions.
- Never weaken safety thresholds without explicit policy approval.

## Config Modules
Store workload-specific configs in a shared module:

```python
SUMMARIZER = {
    "temperature": 0.2,
    "top_p": 0.8,
    "max_output_tokens": 512,
}

IDEATION = {
    "temperature": 0.8,
    "top_p": 0.95,
    "max_output_tokens": 2048,
}
```

Import these dictionaries across FastAPI, Airflow, or notebook workflows to stay DRY.
