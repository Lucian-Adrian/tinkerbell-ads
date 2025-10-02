# Vertex Imagen Prompting Strategies (JavaScript)

## Text + Reference Workflow

```js
import { readFile } from 'node:fs/promises';

const palette = await readFile('palette.png');
const base64 = palette.toString('base64');

const result = await imagen.generateContent({
  contents: [{
    role: 'user',
    parts: [
      { text: 'Illustrate a landing hero inspired by the attached palette.' },
      {
        inlineData: {
          mimeType: 'image/png',
          data: base64
        }
      }
    ]
  }]
});
```

## Seed Management
- Vertex Imagen supports deterministic seeds. Persist seeds alongside prompt metadata in Firestore/BigQuery.
- Use the same seed when stakeholders request minor tweaks.

## Negative Prompts & Safety
- Add `generationConfig = { negativePrompt: 'no text overlay, no watermark' }`.
- Safety filters can block requests; inspect `result.response.promptFeedback`.

## DRY Utilities
- Factor base64 helpers into `libs/images.js` and reuse them for Python via an equivalent module.
- Store prompt templates in JSON files keyed by use case (`hero`, `icon`, `storyboard`).

## Governance
- Catalog all prompts in a Vertex AI Feature Store or BigQuery table for audit trails.
- Tag outputs with Cloud Storage object metadata (e.g., `x-governance-review-state`).