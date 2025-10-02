# Structured Output & Tool Calling on Vertex (Python)

## JSON Schema Enforcement

```python
import json

from vertexai.preview.generative_models import GenerativeModel

schema = {
    "type": "object",
    "properties": {
        "headline": {"type": "string"},
        "sentiment": {"type": "string", "enum": ["positive", "neutral", "negative"]},
        "confidence": {"type": "number"},
    },
    "required": ["headline", "sentiment"],
}

response = model.generate_content(
    contents,
    generation_config={
        "response_mime_type": "application/json",
        "response_schema": schema,
        "temperature": 0,
    },
)

payload = json.loads(response.text)
```

Send metrics (`payload`, tokens, latency) to BigQuery or Cloud Logging for auditing.

## Tool Calling

```python
tool_model = GenerativeModel(
    "gemini-1.5-pro-preview-0514",
    tools=[
        {
            "function_declarations": [
                {
                    "name": "create_invoice",
                    "description": "Generates an invoice in ERP",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "customerId": {"type": "string"},
                            "amount": {"type": "number"},
                            "currency": {"type": "string"},
                        },
                        "required": ["customerId", "amount"],
                    },
                }
            ]
        }
    ],
)

result = tool_model.generate_content(contents)
call = result.candidates[0].function_calls[0]
if call.name == "create_invoice":
    erp_client.create(**call.args)
```

## Audit Logging
- Cloud Logging automatically captures prediction logs—attach labels (`labels.workflow = 'invoice'`).
- Persist tool invocations in BigQuery for compliance.

## Human Review
- Pause before executing high-risk tools; route to a reviewer UI.
- Store reviewer decisions and feed them back as prompt context.

Reuse JSON schemas with JavaScript clients to stay synchronized.
