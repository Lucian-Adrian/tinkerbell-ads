# Veo on Vertex AI (Python)

Ensure Veo is enabled for your project and region.

## Setup

```bash
pip install google-cloud-aiplatform python-dotenv
```

```python
import base64
import os
from pathlib import Path

from dotenv import load_dotenv

import vertexai
from vertexai.preview.generative_models import GenerativeModel

load_dotenv()

project = os.environ["GCLOUD_PROJECT"]
location = "us-central1"
vertexai.init(project=project, location=location)

veo = GenerativeModel("veo-003")
```
 
 ## Generate Video
 
 ```python
 response = veo.generate_content(
     [
         {
             "role": "user",
             "parts": [
                 {
                     "text": "Tracking shot through a rainforest canopy at dawn, cinematic lighting."
                 }
             ],
         }
     ],
     generation_config={
         "video_config": {
             "aspect_ratio": "16:9",
             "duration_seconds": 6,
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
 Path("rainforest.mp4").write_bytes(base64.b64decode(part.inline_data.data))
```
 
 ## Governance
 - Enable Cloud Logging sinks to BigQuery or Chronicle.
 - Attach prompt metadata to Cloud Storage objects using `metadata` argument.
 
 ## Throughput
 - Run Veo jobs in Cloud Tasks / Workflows to handle long runtimes.
 - Provide progress updates in UI via WebSockets / Pub/Sub.
 
 Refer to `gen-video-parameters.md` for a parameter matrix.
