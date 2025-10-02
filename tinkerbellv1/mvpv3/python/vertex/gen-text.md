# Vertex Gemini Text Generation (Python)

Read `../../shared/authentication.md` for credentials and project setup.

## Install & Configure

```bash
pip install google-cloud-aiplatform python-dotenv
```

```python
import os
from dotenv import load_dotenv
import vertexai
from vertexai.preview.generative_models import GenerativeModel

load_dotenv()

project = os.environ["GCLOUD_PROJECT"]
location = "us-central1"
vertexai.init(project=project, location=location)

model = GenerativeModel("gemini-1.5-flash-001")
```

## Basic Prompt

```python
response = model.generate_content(
    "Summarize the attached product spec into 3 bullet points."
)

print(response.text)
```

## Chat Sessions

```python
chat = model.start_chat(history=[])
reply = chat.send_message("Draft a support response for a delayed order.")
print(reply.text)
```

Grant the calling identity `roles/aiplatform.user` and monitor quotas via Cloud Console.
