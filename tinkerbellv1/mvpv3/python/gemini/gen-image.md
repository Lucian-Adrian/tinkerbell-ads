# Imagen 3 via Gemini API (Python)

## Install

```bash
pip install google-generativeai python-dotenv pillow
```

`Pillow` helps save images.

## Generate an Image

```python
import base64
from io import BytesIO

import google.generativeai as genai
from PIL import Image

model = genai.GenerativeModel("imagen-3")

response = model.generate_content(
    [
        {
            "role": "user",
            "parts": [
                {
                    "text": "A cozy reading nook with warm lighting and a cat on the chair."
                }
            ],
        }
    ]
)

image_data = response.candidates[0].content.parts[0].inline_data.data
image_bytes = base64.b64decode(image_data)
Image.open(BytesIO(image_bytes)).save("reading-nook.png")
```

## Quality Controls
- Imagen 3 supports outputs up to 2048×2048.
- Use `generation_config={"image_generation_config": {"aspect_ratio": "3:2", "quality": "high"}}` when available.
- Negative prompts minimize artifacts: `"negative_prompt": "no text, no watermark"`.

## Throughput
- Expect latency of 10–20 seconds. Queue requests and show progress indicators in UI.
- Cache prompt + seed combinations to avoid recomputation.

Continue with `gen-image-prompt.md` for multimodal inputs.
