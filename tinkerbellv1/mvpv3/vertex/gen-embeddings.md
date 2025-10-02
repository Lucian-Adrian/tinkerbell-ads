# Vertex Embeddings (JavaScript)

Vertex hosts multilingual embeddings and image-text embeddings with enterprise governance.

## Setup

```bash
npm install @google-cloud/vertexai dotenv
```

```js
import { VertexAI } from '@google-cloud/vertexai';

const vertexAI = new VertexAI({ project: process.env.GCLOUD_PROJECT, location: 'us-central1' });
const embedder = vertexAI.getGenerativeModel({ model: 'text-embedding-005' });
```

## Single Embedding

```js
const res = await embedder.embedContent({
  content: { parts: [{ text: 'How do I export analytics?' }] }
});

const vector = res.embedding.values;
```

## Batch Embedding

```js
const batched = await embedder.batchEmbedContents({
  requests: documents.map(doc => ({
    content: { parts: [{ text: doc.body }] },
    taskType: 'RETRIEVAL_DOCUMENT'
  }))
});
```

## Multilingual Support
- Use `text-multilingual-embedding-002` for cross-language search.
- For images + captions, switch to `text-image-embedding-001` and provide `inlineData` with `mimeType` + `base64`.

## Storage & Governance
- Persist embeddings in AlloyDB, Bigtable, or a managed vector DB (Pinecone, Milvus).
- Attach dataset lineage metadata in BigQuery for compliance.

Mirror the same flows in Python under `python/vertex/gen-embeddings.md`.