# Imagen 3 on Vertex AI (JavaScript)

Vertex Imagen provides enterprise controls (private networking, IAM) with the same prompt surface.

## Setup

```bash
npm install @google-cloud/vertexai sharp dotenv
```

```js
import { VertexAI } from '@google-cloud/vertexai';
import sharp from 'sharp';

const project = process.env.GCLOUD_PROJECT;
const location = 'us-central1';
const vertexAI = new VertexAI({ project, location });
const imagen = vertexAI.getGenerativeModel({ model: 'imagen-3' });
```

## Generate an Image

```js
const res = await imagen.generateContent({
  contents: [{
    role: 'user',
    parts: [{ text: 'Studio photo of a ceramic mug on a wooden desk with morning light.' }]
  }]
});

const part = res.response.candidates?.[0]?.content?.parts?.[0];
await sharp(Buffer.from(part.inlineData.data, 'base64')).jpeg({ quality: 95 }).toFile('mug.jpg');
```

## Regional Considerations
- Imagen 3 currently supports `us-central1` and `europe-west4`.
- Store outputs in the same region to avoid cross-region egress fees.

## Access Control
- Restrict who can call the model with IAM Conditions (`resource.name.startsWith("projects/.../locations/us-central1")`).
- Log prompt text and output URIs to Cloud Logging for review.

## Cost Management
- Use Vertex AI usage reports; Imagen is billed per image resolution.
- For A/B tests, store prompts + seeds; rerun only when metrics justify.

Check `gen-image-prompt.md` for multimodal conditioning workflows.