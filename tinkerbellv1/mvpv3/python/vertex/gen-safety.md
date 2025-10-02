# Safety & Compliance on Vertex (Python)

Vertex layers enterprise governance onto Gemini policy controls.

## Safety Settings

```python
from vertexai.preview.generative_models import GenerativeModel

model = GenerativeModel(
    "gemini-1.5-pro-preview-0514",
    safety_settings=[
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
        }
    ],
)
```

## Logging & Alerting
- Cloud Logging stores prompt/response metadata (redact user PII upstream).
- Create log-based metrics for `finish_reason="SAFETY"`; alert on spikes.
- Store refusals in BigQuery with hashed user IDs.

## Data Governance
- Enable CMEK on storage buckets for generated assets.
- Use VPC Service Controls to isolate Vertex endpoints.

## Human Review
- Queue flagged outputs for manual review (AppSheet, custom UI).
- Record reviewer outcomes and append to chat history to guide future refusals.

## Testing & Red Teaming
- Mirror regression suites from JavaScript services to detect drift.
- Run quarterly adversarial evaluations; document results in your policy repository.

Share refusal templates across languages to stay consistent with `../../shared/prompt-design.md` guidance.
