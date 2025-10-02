# Configuring Vertex Gemini Calls (Python)

Vertex exposes the same controls plus regional considerations.

## Generation Config

```python
from vertexai.preview.generative_models import GenerativeModel

config = {
    "temperature": 0.3,
    "top_p": 0.8,
    "top_k": 40,
    "max_output_tokens": 1024,
    "stop_sequences": ["END_OF_NOTE"],
    "response_mime_type": "text/plain",
}

response = model.generate_content(
    contents,
    generation_config=config,
)
```

## Safety Settings

```python
model = GenerativeModel(
    "gemini-1.5-pro-preview-0514",
    safety_settings=[
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
        }
    ],
)
```

## Response Metadata
- `response.usage_metadata.total_token_count` → billable tokens.
- `response.candidates[0].finish_reason` → STOP / SAFETY / MAX_TOKENS.
- `response.candidates[0].citation_metadata.citations` → available when connected search is enabled.

## Regional Failover
- Initialize `vertexai.init` per region and instantiate `GenerativeModel` inside try/except.
- Store configs in a shared module (`vertex_presets.py`) and reuse across Cloud Run, Batch, or notebooks.

## DRY Strategy
- Share config dictionaries with JavaScript by serializing them as JSON in `../shared` resources.
- Document updates in source control to keep languages aligned.
