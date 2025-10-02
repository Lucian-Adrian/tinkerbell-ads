# Structured Output & Tool Calling (Python)

Structured responses reduce post-processing errors.

## JSON Schema Enforcement

```python
schema = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "owner": {"type": "string"},
        "dueDate": {"type": "string", "format": "date"},
        "tags": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["title", "dueDate"],
}

response = model.generate_content(
    [
        {
            "role": "user",
            "parts": [
                {
                    "text": "Extract task details from: Finish the Q3 board deck by July 2 for Priya. Tag: strategy."
                }
            ],
        }
    ],
    generation_config={
        "response_mime_type": "application/json",
        "response_schema": schema,
        "temperature": 0,
    },
)

payload = response.text
```

Wrap `json.loads(payload)` in try/except and validate with `pydantic` or `jsonschema`.

## Tool Calling

```python
model_with_tools = genai.GenerativeModel(
    "gemini-1.5-pro",
    tools=[
        {
            "function_declarations": [
                {
                    "name": "create_support_ticket",
                    "description": "Creates a Zendesk ticket",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "subject": {"type": "string"},
                            "body": {"type": "string"},
                            "priority": {
                                "type": "string",
                                "enum": ["low", "normal", "high"],
                            },
                        },
                        "required": ["subject", "body"],
                    },
                }
            ]
        }
    ],
)

result = model_with_tools.generate_content("Customer cannot reset password, escalate.")
call = result.candidates[0].function_calls[0]
if call.name == "create_support_ticket":
    zendesk.create_ticket(**call.args)
```

### Loop Pattern
1. Send user message.
2. If function call returned, execute tool, append tool response with `role="tool"`.
3. Reissue request until plain-text answer.

## Streaming with Tools
- Iterate over `model.generate_content(..., stream=True)`; chunks may include `function_call` payloads.
- Buffer until `chunk.candidates[0].finish_reason == "STOP"` before parsing JSON.

Centralize schemas in a `schemas/` directory and import them from both Python and Node services.
