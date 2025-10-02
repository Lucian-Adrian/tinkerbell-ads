# Imagen 3 on Vertex AI (Python)

## Install

```bash
pip install google-cloud-aiplatform pillow python-dotenv
```

## Initialize

```python
import base64
import os
from io import BytesIO

from dotenv import load_dotenv
from PIL import Image

import vertexai
from vertexai.generative_models import ImageGenerationModel

load_dotenv()

project = os.environ["GCLOUD_PROJECT"]
location = "us-central1"
vertexai.init(project=project, location=location)

imagen = ImageGenerationModel.from_pretrained("imagen-3")
```
 
 ## Generate an Image
 
 ```python
 prompt = "Studio photo of a ceramic mug on a wooden desk with morning light."
 result = imagen.generate_images(prompt=prompt)
 image_bytes = base64.b64decode(result[0].image_bytes)
 Image.open(BytesIO(image_bytes)).save("mug.jpg")
```
 
 ## Regional Considerations
 - Specify a supported region (`us-central1`, `europe-west4`).
 - Store outputs in region-aligned buckets to avoid egress.
 
 ## Governance
 - Restrict permissions with IAM (limit `vertexai.endpoints.predict` to specific service accounts).
 - Log prompts and output URIs to Cloud Logging for review.
 
 See `gen-image-prompt.md` for multimodal strategies.
