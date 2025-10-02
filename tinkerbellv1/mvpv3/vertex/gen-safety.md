# Safety & Compliance on Vertex (JavaScript)

Vertex adds enterprise governance layers on top of Gemini safety filters.

## Enforce Safety Settings

```js
const model = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-pro-preview-0514',
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ]
});
```

## Logging & Alerting
- Cloud Logging automatically captures prompt and response metadata (redact sensitive inputs upstream when required).
- Create log-based metrics for `finishReason = SAFETY`; alert if it spikes.
- Store refusals in BigQuery with hashed user identifiers for auditing.

## Data Governance
- Enable CMEK (customer-managed encryption keys) on storage buckets containing generated assets.
- Use VPC Service Controls to prevent data exfiltration from Vertex endpoints.

## Human Review
- Route flagged outputs to a review queue (AppSheet, internal tool).
- Record reviewer verdict (approved, edited, rejected) and feed back into prompts as guidance.

## Testing & Red-Teaming
- Schedule quarterly red-team exercises; log prompts/responses for retrospective.
- Mirror tests from `gemini/gen-safety.md` to keep policies consistent.

Use the same refusal templates and review workflows in Python services to stay DRY.