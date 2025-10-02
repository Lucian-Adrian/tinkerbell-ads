# Vertex Embeddings (Python)

## Setup

```bash
pip install google-cloud-aiplatform python-dotenv
```

```python
import os

from dotenv import load_dotenv

import vertexai
from vertexai.language_models import TextEmbeddingModel

load_dotenv()

project = os.environ["GCLOUD_PROJECT"]
location = "us-central1"
vertexai.init(project=project, location=location)

embedder = TextEmbeddingModel.from_pretrained("text-embedding-005")
```
 
 ## Single Embedding
 
 ```python
 vector = embedder.get_embeddings(["How do I export analytics?"])[0]
```
 
 ## Batch Embedding
 
 ```python
 vectors = embedder.get_embeddings(
     [doc.body for doc in documents],
     task="RETRIEVAL_DOCUMENT",
 )
```
 
 ## Multilingual & Multimodal
 - Use `text-multilingual-embedding-002` for cross-language search.
 - Switch to `text-image-embedding-001` and provide base64-encoded images plus captions for multimodal retrieval.
 
 ## Storage & Governance
 - Store vectors in AlloyDB, Bigtable, or managed vector DB.
 - Attach dataset lineage metadata in BigQuery for compliance.
 
 Keep parity with JavaScript flows documented in `../../vertex/gen-embeddings.md`.
