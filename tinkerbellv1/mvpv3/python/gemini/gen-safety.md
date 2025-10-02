# Safety & Moderation (Python)

Gemini enforces policy filters; layer your own safeguards.

## Inspect Safety Signals

```python
response = model.generate_content(prompt)

candidate = response.candidates[0]
print(candidate.finish_reason)
print(candidate.safety_ratings)
```

Each rating contains `category` and `probability`.

## Custom Moderation
- Post-process with in-house classifiers or Perspective API.
- Scrub PII (`re` for email/phone) before persisting logs.
- Maintain domain-specific blocklists and allowlists.

## Red Teaming
- Run adversarial prompts quarterly.
- Store prompts/responses in BigQuery for audits.
- Keep refusal messaging consistent; template it in code.

## Safety Settings

```python
import google.generativeai as genai

model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    safety_settings=[
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
        }
    ],
)
```

## Testing
- Snapshot prompts and assert refusal responses.
- Run load tests to ensure fallbacks trigger under rate limits.

Mirror the same processes for Vertex workloads (`../vertex/gen-safety.md`).
