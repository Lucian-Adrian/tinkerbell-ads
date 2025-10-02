# Vertex Imagen Prompting (Python)

## Text + Reference

```python
import base64

with open("palette.png", "rb") as fh:
    base64_ref = base64.b64encode(fh.read()).decode()

result = imagen.generate_images(
    prompt="Illustrate a landing hero inspired by the attached palette.",
    image_context=[
        {
            "mime_type": "image/png",
            "data": base64_ref,
        }
    ],
)
```

## Seed & Variations
- Pass `seed=` to `generate_images` for deterministic output.
- Store seeds and prompt metadata in Firestore / BigQuery.

## Negative Prompts

```python
imagen.generate_images(
    prompt="Modern fintech dashboard UI",
    negative_prompt="no watermark, no stock photo text",
)
```

## Shared Utilities
- Wrap base64 helpers in `images.py` module and reuse across languages.
- Catalog prompts/templates in JSON for compliance.

## Safety
- Handle `result[0].safety_ratings` and display actionable messages.
- Log blocked prompts for moderation review.
