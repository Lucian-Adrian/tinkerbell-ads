# Vertex AI Gemini Text Generation (JavaScript)

Vertex AI offers enterprise controls (VPC, IAM) on top of Gemini. Complete `../shared/authentication.md` first.

## Install & Auth

```bash
npm install @google-cloud/vertexai dotenv
```

Ensure `GOOGLE_APPLICATION_CREDENTIALS` or workload identity is configured. Choose a supported region such as `us-central1`.

## Instantiate Client

```js
import 'dotenv/config';
import { VertexAI } from '@google-cloud/vertexai';

const project = process.env.GCLOUD_PROJECT;
const location = 'us-central1';
const vertexAI = new VertexAI({ project, location });

const generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });
```

## Basic Prompt

```js
const response = await generativeModel.generateContent({
  contents: [{
    role: 'user',
    parts: [{ text: 'Summarize the attached product spec into 3 bullet points.' }]
  }]
});

console.log(response.response.candidates[0].content.parts[0].text);
```

## Streaming Chat Session

```js
const chat = generativeModel.startChat({ history: [] });

const result = await chat.sendMessage('Draft a support response for a delayed order.');
console.log(result.response.text());
```

`startChat` preserves context server-side; truncate history to respect quotas.

## IAM & Quotas
- Grant the service account `roles/aiplatform.user`.
- Adjust per-minute quotas in Google Cloud console if you expect high throughput.
- Use Vertex AI monitoring dashboards for latency and token tracking.

Continue with `gen-text-configure.md` for detailed parameter control.