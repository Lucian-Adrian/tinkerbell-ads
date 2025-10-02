# Model Catalog Cheat Sheet

Keep model names consistent across languages—only the client library changes.

| Capability | Consumer Gemini API | Vertex AI (Gemini on Vertex) | Notes |
| --- | --- | --- | --- |
| General multimodal (text, image, audio, video in/out) | `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-1.5-flash-8b` | `gemini-1.5-pro-preview-0514`, `gemini-1.5-flash-001`, `gemini-1.5-flash-8b` | Flash = faster + cheaper, Pro = highest quality. 1.5 = 1M+ token context. |
| Lightweight text & chat | `gemini-1.0-pro`, `gemini-1.0-pro-vision` | `gemini-pro`, `gemini-pro-vision` | Stable, smaller context; keep for backward compatibility. |
| Image generation | `imagen-3`, `imagen-3-light` | `imagen-3`, `imagen-3-fast` | Imagen 3 supports 2048×2048, `*-light/fast` optimize cost. |
| Video generation | `veo-003` | `veo-003` | Preview; video requests require `videoConfig`. |
| Embeddings | `text-embedding-004`, `text-embedding-005`, `text-multilingual-embedding-002` | `text-embedding-005`, `text-multilingual-embedding-002`, `text-image-embedding-001` | 005 adds 3K token input. |
| Audio understanding | `gemini-1.0-pro-vision` | `gemini-pro-vision` | Provide audio as base64 FLAC/WAV chunks. |

## Selection Tips
- Prefer the newest `1.5` models for long-context multimodal work.
- Start with Flash; upgrade to Pro if quality is insufficient.
- Use the same model name across languages—eases parity between Node and Python implementations.
- For production Vertex workloads, pin to a dated preview (`-preview-0514`) to avoid sudden behavior changes.

## Version Tracking
- Watch the [Gemini release notes](https://ai.google.dev/gemini-api/docs/release-notes) and [Vertex AI release notes](https://cloud.google.com/vertex-ai/docs/release-notes) weekly.
- When a new major model drops, update regression tests for safety filters, latency, and cost.

## Safety Requirements
- Some models (notably Veo) require pre-approval. Submit forms in the Google Cloud console → Vertex AI → **Generative AI** → **Request Access**.
- Maintain content moderation workflows; even if responses pass Google filters, confirm they meet your policy before shipping to users.