# Veo on Vertex AI (JavaScript)

Vertex exposes Veo with enterprise auditing. Ensure your project has Veo access approved.

## Client Boilerplate

```js
import { VertexAI } from '@google-cloud/vertexai';
import { writeFile } from 'node:fs/promises';

const vertexAI = new VertexAI({ project: process.env.GCLOUD_PROJECT, location: 'us-central1' });
const veo = vertexAI.getGenerativeModel({ model: 'veo-003' });
```

## Generate Video

```js
const res = await veo.generateContent({
  contents: [{
    role: 'user',
    parts: [{ text: 'Tracking shot through a rainforest canopy at dawn, cinematic lighting.' }]
  }],
  generationConfig: {
    videoConfig: {
      aspectRatio: '16:9',
      durationSeconds: 6,
      frameRate: 24,
      motionIntensity: 'medium'
    }
  }
});

const part = res.response.candidates?.[0]?.content?.parts?.find(
  p => p.inlineData?.mimeType === 'video/mp4'
);
await writeFile('rainforest.mp4', Buffer.from(part.inlineData.data, 'base64'));
```

## Governance
- Enable Cloud Logging sinks to BigQuery or Chronicle for long-term retention.
- Attach prompt metadata to Cloud Storage objects via `x-goog-meta-*` headers.

## Quotas & Batch Processing
- Veo jobs are heavier; queue them using Cloud Tasks with 1–2 concurrent workers.
- Surface progress to users with WebSockets; include placeholder thumbnails while rendering.

Dive into `gen-video-parameters.md` for configuration details.