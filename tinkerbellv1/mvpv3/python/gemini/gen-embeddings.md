# Embeddings & Retrieval (Python)

## Install

```bash
pip install google-generativeai weaviate-client python-dotenv
```

Swap `weaviate-client` with your vector database SDK.

## Single Embedding

```python
import google.generativeai as genai

embedder = genai.GenerativeModel("text-embedding-005")

result = embedder.embed_content(
    {
        "parts": [{"text": "How do I reset my password?"}]
    }
)

vector = result.embedding.values
```

## Batch Embeddings

```python
requests = [
    {
        "content": {
            "parts": [{"text": doc}]
        }
    }
    for doc in documents
]

batch = embedder.batch_embed_contents({"requests": requests})
embeddings = [item.values for item in batch.embeddings]
```

## Storage Tips
- Convert to `array("f", vector)` for compact binary storage.
- Persist metadata (source, locale, updated_at).
- Partition indices per domain to improve filtering.

## Retrieval Example

```python
query = embedder.embed_content({"content": {"parts": [{"text": user_query}]}})
results = weaviate_client.query.get("Article", ["title", "url"]).with_near_vector(
    {"vector": query.embedding.values}
).with_limit(5).do()
```

## Monitoring
- Recompute embeddings when documents change significantly.
- Track similarity scores over time to catch drift.

Mirror the same approach in Vertex (`../vertex/gen-embeddings.md`).
