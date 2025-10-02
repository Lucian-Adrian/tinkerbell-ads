# Gemini & Vertex Knowledge Base

This repo organizes Gemini and Vertex API playbooks by client language.

## Directory Layout

- `shared/` – Auth, model catalog, and prompt design references used by every language.
- `gemini/` – JavaScript recipes for the consumer Gemini API.
- `vertex/` – JavaScript guides for the Vertex AI enterprise deployment.
- `python/gemini/` – Python equivalents for the consumer Gemini API.
- `python/vertex/` – Python equivalents for Vertex AI.

## Using the Docs

1. Start with `shared/authentication.md` and `shared/model-catalog.md`.
2. Pick your language (`gemini` for JS, `python/gemini` for Python) and follow the topic-specific files (text, image, video, embeddings, streaming, safety).
3. Mirror the same order when you expand to other languages to stay DRY.

Keep files short and modular—add new topics by mirroring the naming convention (`gen-<topic>.md`).
