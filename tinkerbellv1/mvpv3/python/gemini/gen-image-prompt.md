# Multimodal Prompting for Imagen (Python)

## Add Reference Imagery

```python
import base64

with open("moodboard.jpg", "rb") as fh:
    ref_base64 = base64.b64encode(fh.read()).decode()

response = model.generate_content(
    [
        {
            "role": "user",
            "parts": [
                {"text": "Design a minimalist app onboarding screen inspired by this palette."},
                {
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": ref_base64,
                    }
                },
            ],
        }
    ]
)
```

## Sketch-to-Render
- Supply a PNG line drawing plus textual instructions.
- Use `negative_prompt` for elements to avoid.

## Prompt Craft Tips
- Lead with composition, then style (`"isometric illustration of..."`).
- Keep prompts < 300 tokens.
- Iterate: capture feedback, append delta instructions, reuse `seed` for controlled variation.

## Safety Handling
- Check `response.prompt_feedback.block_reason` and display helpful guidance.
- Maintain a moderation checklist (see `../gen-safety.md`).

Reuse base64 helpers across Node and Python by documenting them in `../../shared/prompt-design.md`.
