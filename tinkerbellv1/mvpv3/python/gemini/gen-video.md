# Veo Video Generation (Python)

Ensure Veo access is approved for your project.

## Install

```bash
pip install google-generativeai python-dotenv
```

## Generate Video

```python
import base64
from pathlib import Path

import google.generativeai as genai

veo = genai.GenerativeModel("veo-003")

response = veo.generate_content(
    [
        {
            "role": "user",
            "parts": [
                {
                    "text": "A slow pan over a futuristic city at sunset, drones flying between neon skyscrapers."
                }
            ],
        }
    ],
    generation_config={
        "video_config": {
            "aspect_ratio": "16:9",
            "duration_seconds": 8,
            "frame_rate": 24,
            "motion_intensity": "medium",
        }
    },
)

part = next(
    p
    for p in response.candidates[0].content.parts
    if p.inline_data.mime_type == "video/mp4"
)
Path("futuristic-city.mp4").write_bytes(base64.b64decode(part.inline_data.data))
```

## Prompt Tips
- Describe camera motion, lighting, pacing.
- Avoid references to copyrighted characters.
- Use `generation_config["seed"]` to reproduce takes.

## Response Handling
- Calls block until rendering finishes (30–60s). Run inside async workers with generous timeouts.
- Inspect `response.candidates[0].finish_reason`; handle `"SAFETY"` gracefully.

See `gen-video-parameters.md` for a full parameter table.
