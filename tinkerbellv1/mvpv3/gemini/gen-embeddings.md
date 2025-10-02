# Embeddings & Semantic Search (JavaScript)

Use embeddings for search, clustering, and evaluation.

## Install

```bash
npm install @google/generative-ai @elastic/elasticsearch dotenv
```

`@elastic/elasticsearch` is optional—swap with your vector store client.

## Generate Embeddings

```js
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embedder = genAI.getGenerativeModel({ model: 'text-embedding-005' });

const response = await embedder.embedContent({
  content: { parts: [{ text: 'How do I reset my password?' }] }
});

const vector = response.embedding.values; // Float32 numbers
```

## Batch Embeddings

```js
const faqEntries = [/* ... */];
const batched = await embedder.batchEmbedContents({
  requests: faqEntries.map(text => ({
    content: { parts: [{ text }] }
  }))
});

const vectors = batched.embeddings.map(e => e.values);
```

## Storage Tips
- Cast to Float32Array before storing to reduce size (`Buffer.from(new Float32Array(vector).buffer)`).
- Include metadata: source document, language, last updated timestamp.
- Use separate indices per locale to simplify filtering.

## Semantic Search Recipe

```js
const queryEmbedding = await embedder.embedContent({
  content: { parts: [{ text: userQuery }] }
});

const results = await elastic.search({
  index: 'support-articles',
  knn: {
    field: 'embedding',
    query_vector: queryEmbedding.embedding.values,
    k: 5,
    num_candidates: 200
  }
});
```

## Evaluation & Drift Detection
- Periodically re-run embeddings when docs change materially.
- Track cosine similarity for high-traffic queries; large drops may indicate stale embeddings.

For Python parity, mirror this flow in `../python/gemini/gen-embeddings.md`.